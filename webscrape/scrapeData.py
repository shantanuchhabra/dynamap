import requests

from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base

import re,string

URL = 'https://www.cia.gov/library/publications/the-world-factbook/rankorder/rawdata_%i.txt'

MYSQL_SERVER = 'Protected information' # Protected for security reasons
MYSQL_USER = 'Protected information' # Protected for security reasons
MYSQL_PASS = 'Protected information' # Protected for security reasons
MYSQL_PORT   = 'Protected information'
MYSQL_DB     = 'Protected information' # Protected for security reasons
MYSQL_CONNECT_STRING = "mysql+pymysql://%s:%s@%s:%s/%s" %(MYSQL_USER, MYSQL_PASS, MYSQL_SERVER, MYSQL_PORT, MYSQL_DB)

PROPERTIES = {
'GEOGRAPHY' : {
    2147 : 'Area',
    },
'PEOPLE AND SOCIETY' : {
    2119 : 'Population',
    2002 : 'Population Growth Rate',
    2054 : 'Birth Rate',
    2066 : 'Death Rate',
    2112 : 'Net Migration Rate',
    2223 : 'Maternal Mortality Rate',
    2091 : 'Infant Mortality Rate',
    2102 : 'Life Expectncy at Birth',
    2127 : 'Total Fertility Rate',
    2225 : 'Health Ependitures (% of GDP)',
    2155 : 'Adult Prevalence of HIV/AIDS',
    2156 : 'Number of People Living HIV/AIDS',
    2157 : 'Deaths due to HIV/AIDS (calendar year)',
    2228 : 'Obesity - Adult Prevalence Rate',
    2224 : 'Underweight Children Under 5 Years of Age (%)',
    2206 : 'Education Expenditures (% of GDP)',
    2229 : 'Unemployment Rate - Youth Aged 15-24' 
    },
'ECONOMY' : {
    2001 : 'GDP (PPP)',
    2003 : 'GDP Real Growth Rate',
    2004 : 'GDP Per Capita (PPP)',
    2260 : 'Gross National Saving (% of GDP)',
    2089 : 'Industrial Production Growth Rate (%)',
    2095 : 'Labor Force',
    2129 : 'Unemployment Rate',
    2172 : 'Gini Index (Distribution of Family Income)',
    2221 : 'Taxes and Other Revenues (% of GDP)',
    2222 : 'Budget Surplus (+) or Deficit (-)',
    2186 : 'Public Debt (% of GDP)',
    2092 : 'Inflation Rate (Consumer Prices)',
    2207 : 'Central Bank Discount Rate',
    2208 : 'Commercial Bank Prime Lending Rate',
    2214 : 'Stock of Narrow Money ($)',
    2215 : 'Stock of Broad Money ($)',
    2211 : 'Stock of Domestic Credit ($)',
    2200 : 'Market Value of Publicly Traded Shares ($)',
    2187 : 'Current Account Balance ($)',
    2078 : 'Exports ($)',
    2087 : 'Imports ($)',
    2188 : 'Reserves of Foreign Exchange and Gold ($)',
    2079 : 'External Debt ($)',
    2198 : 'Stock of Direct Foreign Investment - at Home ($)',
    2199 : 'Stock of Direct Foreign Investment - Abroad ($)'
    },
'ENERGY' : {
    2232 : 'Electricity Production (KWH)',
    2233 : 'Electricity Consumption (KWH)',
    2234 : 'Electricity Exports (KWH)',
    2235 : 'Electricity Imports (KWH)',
    2236 : 'Electricity - Installed Generating Capacity (KW)',
    2237 : 'Electricity - From Fossil Fuels (% of total)',
    2239 : 'Electricity - From Nuclear Fuels (% of total)',
    2238 : 'Electricity - From Hydroelectric Plants (% of total)',
    2240 : 'Electricity - From Other Renewable Sources (% of total)',
    2241 : 'Crude Oil Production (barrels/day)',
    2242 : 'Crude Oil Exports (barrels/day)',
    2243 : 'Crude Oil Imports (barrels/day)',
    2244 : 'Crude Oil - Proved Reserves (barrels)',
    2245 : 'Refined Petroleum Products - Production (barrels/day)',
    2246 : 'Refined Petroleum Products - Consumption (barrels/day)',
    2247 : 'Refined Petroleum Products - Exports (barrels/day)',
    2248 : 'Refined Petroleum Products - Imports (barrels/day)',
    2249 : 'Natural Gas Production (cubic meters)',
    2250 : 'Natural Gas Consumption (cubic meters)',
    2251 : 'Natural Gas Exports (cubic meters)',
    2252 : 'Natural Gas Imports (cubic meters)',
    2253 : 'Natural Gas - Proved Reserves (cubic meters)'
    },
'COMMUNICATIONS' : {
    2150 : 'Telephones - Main Lines in Use',
    2151 : 'Telephones - Mobile Cellular',
    2153 : 'Internet Users',
    },    
'TRANSPORTATION' : {
    2053 : 'Airports',
    2121 : 'Railways (KM)',
    2085 : 'Roadways (KM)',
    2093 : 'Waterways (KM)',
    2108 : 'Merchant Marine',
    },
'MILITARY' : {
    2034 : 'Military Expenditures (% of GDP)'
    }
}

def getRawData(url):
    # reads from url and returns it
    response = requests.get(url)
    rawData = None
    if response.status_code == 200:
        rawData = response.content
    else:
        print url, response.status_code
        print 'There was a problem with the request.'
    return rawData

def parseRawData(rawData, key = 2004):
    parsedData = rawData.split('\n')
    parsedData.pop()
    for i,row in enumerate(parsedData):
        rank = row[:7]
        country = row[7:58]
        value = row[58:]
        while country[-1].isspace(): country = country[:-1]
        if (key == 2004 and i == 0): value = '93000' 
        rank = int(rank)
        value = value.replace('$','')
        value = value.replace(',','')
        value = value.replace(' ','')
        value = value.replace('\r','')
        value = float(value)
        parsedData[i] = [rank,country,value]
    return parsedData


def getCountryQueryString(parsedData, index):
    queryString = "INSERT INTO country (id, name, iso) VALUES ";
    row = parsedData[index]
    country = row[1]
    if (country == "Cote d'Ivoire"): country = "Cote dIvoire"
    newRecord = "(%i, '%s', 'aa')" %(index+1, country)
    queryString += (newRecord + ';')
    return queryString

def connectToDb():
    engine = create_engine(MYSQL_CONNECT_STRING)
    return engine.connect()

def loadCountries():
    connection = connectToDb()
    key = 2147
    parsedData = parseRawData(getRawData(URL %(key)))
    for index in xrange(len(parsedData)):
        sqlQuery = getCountryQueryString(parsedData, index)
        connection.execute(sqlQuery)

def loadCategories():
    connection = connectToDb()
    queryTemplate = 'INSERT INTO category (id, value) VALUES'
    for i,category in enumerate(sorted(PROPERTIES.keys())):    
        newRecord = "(%i, '%s')" %(i+1, category)
        queryString = queryTemplate + newRecord + ';'
        connection.execute(queryString)
    connection.close()

def loadProperties():
    connection = connectToDb()
    queryTemplate = 'INSERT INTO `property` (`id`, `value`, `category_id`) VALUES '
    queryString = queryTemplate
    for i,category in enumerate(sorted(PROPERTIES.keys())):
        for property_id in PROPERTIES[category]:
            newRecord = "(%i, '%s', %i)" %(property_id, PROPERTIES[category][property_id], i+1)
            queryString += newRecord + ','
    queryString = queryString[:-1] + ';'
    print queryString
    connection.execute(queryString)
    connection.close()

def getCountryID(country):
    connection = connectToDb()
    queryString = "SELECT id FROM country WHERE name='%s';" %(country)
    try:
        result = connection.execute(queryString)
        row = result.fetchone()
        connection.close()
        return row[0]
    except:
        return None

def loadCountriesProperties():
    connection = connectToDb()
    counter = 0
    query = "INSERT INTO country_property (country_id, property_id, value) VALUES "
    for category in PROPERTIES:
        for key in PROPERTIES[category]:
            property_id = key
            rawdata    = getRawData(URL %(key))
            parsedData = parseRawData(rawdata, key)
            for index in xrange(len(parsedData)):
                row = parsedData[index]
                country = row[1]
                if (country == "Cote d'Ivoire"): country = "Cote dIvoire"
                #print country
                country_id = "(SELECT id FROM country WHERE name='%s')" %(country)
                if (country_id != None):
                    value = row[2]
                    query += "(%s, %d, %s)," %(country_id, property_id, value)
                    print counter
                    counter += 1
    query = query[:-1] + ';'
    print query
    #connection.execute(query)
    connection.close()

def main():
    #loadCountriesProperties()
    # loadCatgories()
    # loadProperties()
    loadCountriesProperties()

main()
