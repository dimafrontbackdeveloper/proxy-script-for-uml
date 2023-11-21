import axios, { AxiosRequestConfig } from 'axios'
import { TResponse } from 'src/types'
import { API_KEY } from './../constants'

export const postRequest = async <T>(
	url: string,
	body: Record<string, any>
): Promise<TResponse<T>> => {
	try {
		const data = await axios.post(`${url}?api_key=${API_KEY}`, body)

		return {
			statusCode: data.status,
			data: data.data,
		}
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				throw new Error(
					`Request failed with status code ${error.response.status}`
				)
			} else if (error.request) {
				throw new Error('No response received from the server')
			} else {
				throw new Error(`Error setting up the request: ${error.message}`)
			}
		} else {
			throw new Error(`Unexpected error: ${error}`)
		}
	}
}

export const jsonParse = (json: string) => {
	let result

	try {
		result = JSON.parse(json)
	} catch (err) {
		result = []
	}

	return result
}

export function isStatusCodeSuccessful(statusCode: number): boolean {
	return statusCode >= 200 && statusCode < 300
}

export const getRequest = async <T>(
	url: string,
	params: AxiosRequestConfig,
	isNeedApiKey = true
): Promise<TResponse<T>> => {
	try {
		const data = await axios.get(
			`${url}${isNeedApiKey ? `?api_key=${API_KEY}` : ''}`,
			params
		)

		return {
			statusCode: data.status,
			data: data.data,
		}
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				throw new Error(
					`Request failed with status code ${error.response.status}`
				)
			} else if (error.request) {
				throw new Error('No response received from the server')
			} else {
				throw new Error(`Error setting up the request: ${error.message}`)
			}
		} else {
			throw new Error(`Unexpected error: ${error}`)
		}
	}
}

export const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message
	} else {
		return 'Unknown error'
	}
}
