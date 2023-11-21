export type TProxyType = 'dedicated' | 'shared'

export type TProxyIpVersion = 4 | 6

export type TProxyPeriod =
	| 5
	| 10
	| 20
	| 30
	| 60
	| 90
	| 120
	| 150
	| 180
	| 210
	| 240
	| 270
	| 300
	| 330
	| 360

export type TProxyCountryCode =
	| 'ru' // Россия
	| 'ca' // Канада
	| 'us' // США
	| 'de' // Германия
	| 'gb' // Великобритания
	| 'nl' // Нидерланды
	| 'es' // Испания
	| 'it' // Италия
	| 'id' // Индонезия
	| 'fr' // Франция
	| 'ch' // Швейцария
	| 'pt' // Португалия
	| 'ua' // Украина
	| 'kz' // Казахстан
	| 'cn' // Китай
	| 'pl' // Польша
	| 'in' // Индия
	| 'jp' // Япония
	| 'au' // Австралия
	| 'at' // Австрия
	| 'az' // Азербайджан
	| 'al' // Албания
	| 'dz' // Алжир
	| 'ar' // Аргентина
	| 'am' // Армения
	| 'bd' // Бангладеш
	| 'by' // Беларусь
	| 'be' // Бельгия
	| 'bg' // Болгария
	| 'bo' // Боливия
	| 'ba' // Босния и Герцеговина
	| 'br' // Бразилия
	| 'hu' // Венгрия
	| 've' // Венесуэла
	| 'vn' // Вьетнам
	| 'hk' // Гонконг
	| 'gr' // Греция
	| 'ge' // Грузия
	| 'dk' // Дания
	| 'eg' // Египет
	| 'zm' // Замбия
	| 'il' // Израиль
	| 'jo' // Иордания
	| 'ie' // Ирландия
	| 'is' // Исландия
	| 'kh' // Камбоджа
	| 'cm' // Камерун
	| 'qa' // Катар
	| 'ke' // Кения
	| 'cy' // Кипр
	| 'co' // Колумбия
	| 'cr' // Коста-Рика
	| 'ci' // Кот-д'Ивуар
	| 'cu' // Куба
	| 'kg' // Кыргызстан
	| 'lv' // Латвия
	| 'lb' // Ливан
	| 'ly' // Ливия
	| 'lt' // Литва
	| 'lu' // Люксембург
	| 'my' // Малайзия
	| 'mv' // Мальдивы
	| 'mt' // Мальта
	| 'ma' // Марокко
	| 'mx' // Мексика
	| 'md' // Молдова
	| 'mc' // Монако
	| 'mn' // Монголия
	| 'np' // Непал
	| 'nz' // Новая Зеландия
	| 'no' // Норвегия
	| 'ae' // ОАЭ
	| 'py' // Парагвай
	| 'pe' // Перу
	| 'ro' // Румыния
	| 'sa' // Саудовская Аравия
	| 'sc' // Сейшелы
	| 'rs' // Сербия
	| 'sg' // Сингапур
	| 'sk' // Словакия
	| 'si' // Словения
	| 'tw' // Тайвань
	| 'th' // Тайланд
	| 'tz' // Танзания
	| 'tn' // Тунис
	| 'tm' // Туркменистан
	| 'tr' // Турция
	| 'uz' // Узбекистан
	| 'uy' // Уругвай
	| 'ph' // Филиппины
	| 'fi' // Финляндия
	| 'hr' // Хорватия
	| 'me' // Черногория
	| 'cz' // Чехия
	| 'cl' // Чили
	| 'se' // Швеция
	| 'lk' // Шри-Ланка
	| 'ee' // Эстония
	| 'et' // Эфиопия
	| 'za' // Южная Африка
	| 'sd' // Южный Судан
	| 'jm' // Ямайка

export interface TProxy {
	host: string
	port: number
	username: string
	password: string
}

export interface TApiCreds {
	login: string
	password: string
}

export interface TProxyCreds {
	host: string
	port: number
	username: string
	password: string
}

export interface TAvailableCreds {
	id: string
	apiCreds: TApiCreds
	proxyCreds: TProxyCreds
}

export interface TResponse<T> {
	statusCode: number
	data: T
	message?: string
}

export type TCheckProxyReponce = {
	statusCode: number
	message?: string
}
