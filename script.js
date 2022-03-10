const DEFAULT_SIZE = 10;
let env;

const handleSearch = async (e) => {
    e.preventDefault();
    if (e.key === "Enter") {
        const query = e.target.value
        await search(query)
    }
}

const changeResultSize = async (size) => {
    const query = document.getElementById("query").value
    await search(query, size)
}

const search = async (query, size) => {
    const { results } = await fetchData(query)
    const columns = [
        "product_id",
        "style_number",
        "brand_name",
        "category",
        "color",
        "price",
        "description",
        "image",
    ]
    const preparedResults = await prepareData(results, columns)
    // populate("search-result-1", columns, preparedResults, size)
    populate("search-result-2", columns, preparedResults, size)
}

const fetchData = async (query) => {
    const url = `${env["API_URL"]}?auth_token=${env["SEARCH_TOKEN"]}&query=${query}`
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
    }
    return await res.json()
}

const populate = async (tableId = "", columns = [], data = [], size = DEFAULT_SIZE) => {
    // initialize table
    const table = document.getElementById(tableId)
    const thead = table.getElementsByTagName('thead')[0]
    const tbody = table.getElementsByTagName('tbody')[0]

    // empty table content
    tbody.innerHTML = ""
    thead.innerHTML = ""

    // create header 
    createTableHead(thead, columns)

    // create body 
    createTableBody(tbody, columns, data, size)
}

const createTableHead = (thead, columns = []) => {
    const theadRow = document.createElement("tr")
    for (col of columns) {
        const theadCol = document.createElement("th")
        theadCol.textContent = col
        theadRow.appendChild(theadCol)
    }
    thead.appendChild(theadRow)
}

const createTableBody = (tbody, columns = [], data = [], size) => {
    let i = 0;
    for (record of data) {
        if (i === parseInt(size)) break
        const tbodyRow = document.createElement("tr")
        for (col of columns) {
            const tbodyCol = document.createElement("td")
            if (col === "image") {
                const img = document.createElement("img")
                img.src = record[col]
                tbodyCol.appendChild(img)
            } else { tbodyCol.textContent = record[col] }
            tbodyRow.appendChild(tbodyCol)
        }
        tbody.appendChild(tbodyRow)
        i++;
    }
}

const prepareData = async (results = [], columns = []) => {
    return results.map((obj, _) => {
        let newObj = {}
        for (const [key, value] of Object.entries(obj)) {
            if (columns.includes(key)) newObj[key] = value["raw"]
        }
        return newObj
    })
}

const getEnv = async (key = "") => {
    try {
        const env = await $.getJSON("env.json")
        return key ? env[key] : env
    } catch (error) {
        throw error
    }
}

$(document).ready(async () => {
    env = await getEnv()
})