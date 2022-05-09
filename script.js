const DEFAULT_SIZE = 15;
const SUGGESTIONS_SIZE = 5;
let env, searchWrapper, suggBox, queryBox;

/**
 * detect Enter key in query field and fire search calls 
 * or suggestions call.
 * @param {evnet} e 
 */
const onKeyPress = async (e) => {
    e.preventDefault();
    const query = e.target.value
    if (e.key === "Enter") {
        const size = document.getElementById("result-size").value
        await newSearch(query, size)
    } else {
        if (query) {
            await newSearchSuggestions(query)
        }
        else { searchWrapper.classList.remove("active"); }
    }
}

/**
 * get query from searchBar and fire search calls.
 * @param {integer} size // for custom page size.
 */
const handleSearch = async () => {
    const query = queryBox.value
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
    const engine = document.getElementById('engine').value
    const url = `${env["NEW_SEARCH_URL"]}/${engine}/search`
    const data = {
        query,
        filters: {
            none: [
                {
                    is_sold_out: ["Y", "1"]
                },
                {
                    is_active: "N"
                },
                {
                    vendor_active: "N"
                },
                {
                    is_hidden: "Y"
                },
                {
                    is_prepare: "Y"
                }
            ]
        },
        sort: [
            { "_score": "desc" },
            { "created_date": "desc" },
            { "popular_point_14": "desc" }
        ],
        page: {
            current: 1,
            size: parseInt(size)
        },
    }
    const headers = {
        Authorization: `Bearer ${env["NEW_SEARCH_TOKEN"]}`,
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
        "price",
        "description",
        "default_picture",
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
 * use to get suggestions according to query.
 * @param {string} query 
 * @param {integer} size 
 */
const newSearchSuggestions = async (query = "", size = SUGGESTIONS_SIZE) => {
    const engine = document.getElementById('engine').value
    const url = `${env["NEW_SEARCH_URL"]}/${engine}/query_suggestion`
    const columns = [
        "style_name",
        "group_name",
        "brand_name",
        "category",
        "sub_category",
        "color_list",
    ]
    const data = {
        query,
        types: {
            documents: {
                fields: columns
            }
        },
        size
    }
    const headers = {
        Authorization: `Bearer ${env["NEW_SEARCH_TOKEN"]}`,
        "Content-Type": "application/json",
    }
    const { results } = await fetchData(url, "POST", data, headers, false)
    const preparedResults = await prepareNewSuggestionsData(results, columns)
    await makeSuggestions(preparedResults)
}

/**
 * Fetch Data from api `url`
 * @param {string} url 
 * @param {string} method 
 * @param {object} data 
 * @param {object} headers 
 * @returns 
 */
const fetchData = async (url, method = "GET", data = {}, headers = {}, loader = true) => {
    let payload = { method, headers }
    if (method !== "GET") payload["body"] = JSON.stringify(data)
    if (loader) await show(".loader", "flex")
    const res = await fetch(url, payload)
    if (loader) await hide(".loader")
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
    if (!data.length) {
        // in-case no record is returned.
        createNoTableBody(tbody, columns.length + 1)
        return
    }

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
            if (col === "default_picture") {
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

const createNoTableBody = (tbody, colSpan) => {
    const tbodyRow = document.createElement("tr")
    const tbodyCol = document.createElement("td")
    tbodyCol.colSpan = colSpan
    tbodyCol.textContent = "No Record Found."
    tbodyCol.style.textAlign = "center"
    tbodyCol.style.color = "red"
    tbodyRow.appendChild(tbodyCol)
    tbody.appendChild(tbodyRow)
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
 * use to prepare new search data before poplating to the 
 * table.
 * @param {array} results 
 * @param {array} columns 
 * @returns 
 */
const prepareNewSuggestionsData = async (results = [], columns = []) => {
    return results?.documents.map((obj, _) => {
        return obj.suggestion
    })
}

/**
 * use to select element from suggestions
 * @param {htmlElement} element 
 */
const select = async (element) => {
    let selectData = element.textContent;
    queryBox.value = selectData;
    searchWrapper.classList.remove("active");
}

/**
 * show suggestions
 * @param {array} list 
 */
const showSuggestions = async (list) => {
    let listData;
    if (!list.length) {
        userValue = queryBox.value;
        listData = `<li>${userValue}</li>`;
    } else {
        listData = list.join('');
    }
    suggBox.innerHTML = listData;
}

/**
 * use to render suggestions
 * @param {array} results 
 */
const makeSuggestions = async (results = []) => {
    await showSuggestions(
        results.map((data) => {
            return data = `<li>${data}</li>`;
        })
    );

    searchWrapper.classList.add("active");
    let allList = suggBox.querySelectorAll("li");
    for (let i = 0; i < allList.length; i++) {
        //adding onclick attribute in all li tag
        allList[i].setAttribute("onclick", "select(this)");
    }
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
    // initializing
    env = await getEnv()
    await initLoader()
    searchWrapper = document.querySelector(".search-input");
    suggBox = searchWrapper.querySelector(".autocom-box");
    queryBox = document.getElementById("query")
})