const DEFAULT_SIZE = 15;
let env;

/**
 * detect Enter key in query field and fire search calls.
 * @param {evnet} e 
 */
const onKeyPress = async (e) => {
    e.preventDefault();
    if (e.key === "Enter") {
        const query = e.target.value
        const size = document.getElementById("result-size").value
        await newSearch(query, size)
    }
}

/**
 * get query from searchBar and fire search calls.
 * @param {integer} size // for custom page size.
 */
const handleSearch = async () => {
    const query = document.getElementById("query").value
    const size = document.getElementById("result-size").value
    await newSearch(query, size)
    await prodSearch(query, size)
}

/**
 * use new search and populate data in table
 * @param {string} query 
 * @param {integer} size 
 */
const newSearch = async (query = "", size = DEFAULT_SIZE) => {
    const url = `${env["API_URL"]}`
    const data = {
        query,
        page: {
            size: parseInt(size)
        }
    }
    const headers = {
        Authorization: `Bearer ${env["SEARCH_TOKEN"]}`,
        "Content-Type": "application/json",
    }
    const { results } = await fetchData(url, "POST", data, headers)
    const columns = [
        "product_id",
        "style_name",
        "style_number",
        "group_name",
        "brand_name",
        "category",
        "sub_category",
        "color",
        "price",
        "description",
        "image",
    ]
    const preparedResults = await prepareNewData(results, columns)
    populate("search-result-1", columns, preparedResults, size)
}

/**
 * use production search and populate data in table
 * @param {string} query 
 * @param {integer} size 
 */
const prodSearch = async (query = "", size = DEFAULT_SIZE) => {
}

/**
 * Fetch Data from api `url`
 * @param {string} url 
 * @param {string} method 
 * @param {object} data 
 * @param {object} headers 
 * @returns 
 */
const fetchData = async (url, method = "GET", data = {}, headers = {}) => {
    let payload = { method, headers }
    if (method !== "GET") payload["body"] = JSON.stringify(data)
    await show(".loader", "flex")
    const res = await fetch(url, payload)
    await hide(".loader")
    if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
    }
    return await res.json()
}

/**
 * use to populate data into table.
 * @param {string} tableId 
 * @param {array} columns 
 * @param {array} data 
 * @param {integer} size 
 */
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

/**
 * use to create head of the table
 * @param {htmlElement} thead 
 * @param {array} columns 
 */
const createTableHead = (thead, columns = []) => {
    // initialize the row
    const theadRow = document.createElement("tr")

    // store index
    const indexCol = document.createElement("th")
    indexCol.textContent = "#"
    theadRow.appendChild(indexCol)

    for (col of columns) {
        const theadCol = document.createElement("th")
        theadCol.textContent = col
        theadRow.appendChild(theadCol)
    }
    thead.appendChild(theadRow)
}

/**
 * use to create head of the table
 * @param {htmlElement} tbody 
 * @param {array} columns 
 * @param {array} data 
 * @param {integer} size 
 */
const createTableBody = (tbody, columns = [], data = [], size) => {
    let i = 0;
    for (record of data) {
        if (i === parseInt(size)) break
        // initialize the row
        const tbodyRow = document.createElement("tr")
        // store index
        const indexCol = document.createElement("td")
        indexCol.textContent = i + 1
        tbodyRow.appendChild(indexCol)

        for (col of columns) {
            // store column value
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

/**
 * initate loader
 */
const initLoader = async () => {
    const loader = document.querySelector('.loader');
    const emoji = loader.querySelector('.emoji');
    const emojis = ["🕐", "🕜", "🕑", "🕝", "🕒", "🕞", "🕓", "🕟", "🕔", "🕠", "🕕", "🕡", "🕖", "🕢", "🕗", "🕣", "🕘", "🕤", "🕙", "🕥", "🕚", "🕦", "🕛", "🕧"];
    const interval = 125;

    setInterval(() => {
        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    }, interval);
}

/**
 * show html element
 * @param {string} element 
 * @param {string} value 
 */
const show = async (element, value = "unset") => {
    document.querySelector(element).style.display = value;
}

/**
 * hide html element
 * @param {string} element 
 */
const hide = async (element) => {
    document.querySelector(element).style.display = "none";
}

/**
 * use to prepare new search data before poplating to the 
 * table.
 * @param {array} results 
 * @param {array} columns 
 * @returns 
 */
const prepareNewData = async (results = [], columns = []) => {
    return results.map((obj, _) => {
        let newObj = {}
        for (const [key, value] of Object.entries(obj)) {
            if (columns.includes(key)) newObj[key] = value["raw"]
        }
        return newObj
    })
}

/**
 * load env.json file when document is loaded.
 * @param {string} key 
 * @returns 
 */
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
    await initLoader()
})