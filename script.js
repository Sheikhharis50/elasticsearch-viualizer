const DEFAULT_SIZE = 10;

const search = async (e) => {
    if (e.key === "Enter") {
        console.log(e.target.value);
        const results = await fetchData(
            await getEnv("API_URL"),
            "GET",
            {
                "query": e.target.value
            },
        )
        console.log(results);
    }
}

const getInitialData = async (size) => {
    // populate("search-result-1", ["id", "title", "completed", "userId"], results, size)
    // populate("search-result-2", ["id", "title", "completed", "userId"], results, size)
}

const fetchData = async (url, method = "GET", data = {}) => {
    const res = await fetch(url, {
        method,
        headers: { Authentication: `Bearer ${await getEnv("SEARCH_TOKEN")}` }
    })
    if (!res.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    return res.json()
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
            tbodyCol.textContent = record[col]
            tbodyRow.appendChild(tbodyCol)
        }
        tbody.appendChild(tbodyRow)
        i++;
    }
}

const getEnv = async (key) => {
    try {
        const env = await $.getJSON("env.json")
        return env[key]
    } catch (error) {
        throw error
    }
}