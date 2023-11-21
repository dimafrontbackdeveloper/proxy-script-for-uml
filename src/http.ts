import fs from 'fs'
import tunnel from 'tunnel'
import { PROXY_API_URL } from './constants'
import { credentials } from './creds'
import {
	TApiCreds,
	TAvailableCreds,
	TCheckProxyReponce,
	TProxy,
	TProxyCountryCode,
	TProxyIpVersion,
	TProxyPeriod,
	TProxyType,
	TResponse,
} from './types'
import {
	getErrorMessage,
	getRequest,
	isStatusCodeSuccessful,
	postRequest,
} from './utils/defaults'

let sessionAvailableCreds: Array<TAvailableCreds> = []

class CProxy {
	static instance: CProxy
	pinnacleNameForTesting: string // походит любые рабочие креды для пиннакла. Они нужны будут для тестирования проксей
	pinnaclePasswordForTesting: string // походит любые рабочие креды для пиннакла. Они нужны будут для тестирования проксей

	constructor(
		pinnacleNameForTesting: string,
		pinnaclePasswordForTesting: string
	) {
		this.pinnacleNameForTesting = pinnacleNameForTesting
		this.pinnaclePasswordForTesting = pinnaclePasswordForTesting

		if (CProxy.instance) {
			return CProxy.instance
		}

		CProxy.instance = this
	}

	getAvailableCreds(): TResponse<Array<TAvailableCreds>> {
		return {
			data: sessionAvailableCreds,
			statusCode: 200,
		}
	}

	private createEmptyAvailableCreds() {
		fs.writeFileSync('availableCreds.json', JSON.stringify([]))
		sessionAvailableCreds = []
	}

	async completeAvailableCredentials({
		type,
		ipVersion,
		country,
		period,
	}: {
		type: TProxyType
		ipVersion: TProxyIpVersion
		country: TProxyCountryCode
		period: TProxyPeriod
	}) {
		const countOfProxiesToBuy =
			Number(credentials.length) - Number(sessionAvailableCreds.length)

		try {
			const { statusCode, data: proxies } = await this.buyProxies({
				type,
				ipVersion,
				country,
				period,
				quantity: countOfProxiesToBuy,
			})

			if (!isStatusCodeSuccessful(statusCode)) {
				throw new Error(`error on buy proxy. Status code: ${statusCode}`)
			}

			let indexOfAddedProxy = 0

			// перебираем все креды.
			credentials.forEach(credential => {
				// проверяем есть ли такой кред в sessionAvailableCreds.
				if (
					!sessionAvailableCreds.find(sessionAvailableCred => {
						return (
							sessionAvailableCred.apiCreds.login === credential.login &&
							sessionAvailableCred.apiCreds.password === credential.password
						)
					})
				) {
					// Если нету, то добавляем этот кред в sessionAvailableCreds, и добавляем к ниму прокси
					sessionAvailableCreds.push({
						id: this.generateId(credential, proxies[indexOfAddedProxy]),
						apiCreds: credential,
						proxyCreds: {
							host: proxies[indexOfAddedProxy].host,
							port: proxies[indexOfAddedProxy].port,
							username: proxies[indexOfAddedProxy].username,
							password: proxies[indexOfAddedProxy].password,
						},
					})

					indexOfAddedProxy += 1
				}
			})

			fs.writeFileSync(
				'availableCreds.json',
				JSON.stringify(sessionAvailableCreds)
			)

			return {
				data: sessionAvailableCreds,
				statusCode: 200,
			}
		} catch (error) {
			return {
				statusCode: -1,
				data: [],
				message: `Error in supplementing proxies: ${getErrorMessage(error)}`,
			}
		}
	}

	private generateId(credential: TApiCreds, proxy: TProxy): string {
		return `${credential.login}:${credential.password}:${proxy.host}`
	}

	private saveProxiesToFile(proxies: Array<TProxy>) {
		fs.appendFileSync('allProxies.txt', JSON.stringify(proxies))
	}

	private clearAvailableCreads() {
		fs.writeFileSync('availableCreds.json', JSON.stringify([]))
		sessionAvailableCreds = []
	}

	// создать заново файл с доступными кредами используя свои прокси (возможно не пригодится этот метод)
	createAvailableCredsUsingOwnProxies(proxies: Array<TProxy>) {
		this.createEmptyAvailableCreds()

		credentials.forEach((credential, i) => {
			const cred = {
				id: this.generateId(credential, proxies[i]),
				apiCreds: {
					login: credential.login,
					password: credential.password,
				},
				proxyCreds: {
					host: proxies[i].host,
					port: proxies[i].port,
					username: proxies[i].username,
					password: proxies[i].password,
				},
			}

			sessionAvailableCreds.push(cred)
		})

		fs.writeFileSync(
			'availableCreds.json',
			JSON.stringify(sessionAvailableCreds)
		)
	}

	async buyProxies({
		type, // добавить только дедикейтед (или нет. Пересмотреть)
		ipVersion,
		country,
		period,
		quantity,
	}: {
		type: TProxyType // добавить только дедикейтед (или нет. Пересмотреть)
		ipVersion: TProxyIpVersion
		country: TProxyCountryCode
		period: TProxyPeriod
		quantity: number
	}): Promise<TResponse<TProxy[]>> {
		const body = {
			type,
			ip_version: ipVersion,
			country,
			period,
			quantity,
		}

		const url = `${PROXY_API_URL}/api/new-order/`

		try {
			const { statusCode, data } = await postRequest<TProxy[]>(url, body)

			this.saveProxiesToFile(data)
			return {
				statusCode,
				data,
			}
		} catch (error) {
			return {
				statusCode: -1,
				data: [],
				message: `Error in buying proxies: ${getErrorMessage(error)}`,
			}
		}
	}

	async checkProxy(proxy: TProxy): Promise<TCheckProxyReponce> {
		const apiToken = Buffer.from(
			this.pinnacleNameForTesting + ':' + this.pinnaclePasswordForTesting
		).toString('base64')

		const headers = { Authorization: 'Basic ' + apiToken }

		const agent = tunnel.httpsOverHttp({
			proxy: {
				host: proxy.host,
				port: proxy.port,
				proxyAuth: `${proxy.username}:${proxy.password}`,
			},
		})

		const server_timeout = 4500

		const url = `https://api.pinnacle.com/v1/odds?sportId=29&oddsFormat=Decimal&isLive=1&since=1&leagueIds=${[
			1,
		]}`

		try {
			const { data, statusCode } = await getRequest(
				url,
				{
					headers,
					httpsAgent: agent,
					timeout: server_timeout,
				},
				false
			)

			return {
				statusCode,
			}
		} catch (error) {
			return {
				statusCode: -1,
				message: `Error in checking proxy: ${getErrorMessage(error)}`,
			}
		}
	}

	async checkProxies(
		proxies: Array<TProxy>
	): Promise<TResponse<Array<TCheckProxyReponce>>> {
		try {
			const checkedProxiesPromises = proxies.map(proxy =>
				this.checkProxy(proxy)
			)
			const checkedProxies = await Promise.all(checkedProxiesPromises)

			return {
				data: checkedProxies,
				statusCode: 200,
			}
		} catch (error) {
			return {
				data: [],
				statusCode: -1,
				message: `Error in checking proxies: ${getErrorMessage(error)}`,
			}
		}
	}

	deleteSomeAvailableCreds(availableCredIds: Array<string>) {
		const filteredSessionAvailableCreds = sessionAvailableCreds.filter(
			availableCred => {
				if (
					!availableCredIds.find(availableCredId => {
						return availableCredId === availableCred.id
					})
				)
					return availableCred
			}
		)

		sessionAvailableCreds = filteredSessionAvailableCreds

		fs.writeFileSync(
			'availableCreds.json',
			JSON.stringify(filteredSessionAvailableCreds)
		)
	}

	async init({
		type,
		ipVersion,
		country,
		period,
	}: {
		type: TProxyType
		ipVersion: TProxyIpVersion
		country: TProxyCountryCode
		period: TProxyPeriod
	}): Promise<TResponse<Array<TAvailableCreds>>> {
		try {
			if (fs.existsSync('availableCreds.json')) {
				// если есть файл с доступными кредами, то проверить какие прокси у кредов работают, и пересобрать файл с работающими проксями
				const availableCreds = JSON.parse(
					fs.readFileSync('availableCreds.json', 'utf-8')
				)

				// проверяем работают ли прокси в файле
				const checkedCreds: Array<TAvailableCreds> = []

				for (const creds of availableCreds) {
					const checkedProxy = await this.checkProxy(creds.proxyCreds)

					if (isStatusCodeSuccessful(checkedProxy.statusCode)) {
						checkedCreds.push(creds)
					}
				}

				// перезаписываем availableCreds с работающими проксями
				fs.writeFileSync('availableCreds.json', JSON.stringify(checkedCreds))
				sessionAvailableCreds = checkedCreds

				return {
					statusCode: 200,
					data: checkedCreds,
				}
			} else {
				// если нету файла, то создаем пустой файл, и наполняем его доступными кредами
				this.createEmptyAvailableCreds()

				await this.completeAvailableCredentials({
					type,
					ipVersion,
					country,
					period,
				})

				return {
					statusCode: 200,
					data: sessionAvailableCreds,
				}
			}
		} catch (error) {
			throw new Error(`Ошибка при инициализации: ${getErrorMessage(error)}`)
		}
	}

	// удаление доступных кредов, покупки новых прокси, и дособирание файла с доступными кредами
	async deleteAndCompleteSomeAvailableCreds({
		availableCredIds,
		type,
		ipVersion,
		country,
		period,
	}: {
		availableCredIds: Array<string>
		type: TProxyType
		ipVersion: TProxyIpVersion
		country: TProxyCountryCode
		period: TProxyPeriod
	}) {
		try {
			this.deleteSomeAvailableCreds(availableCredIds)

			await this.completeAvailableCredentials({
				type,
				ipVersion,
				country,
				period,
			})
		} catch (error) {
			return {
				statusCode: -1,
				data: [],
				message: `Error in deleting and supplementing proxies: ${getErrorMessage(
					error
				)}`,
			}
		}
	}
}

export default CProxy
