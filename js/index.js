// Api urls

const ProxyApi = "https://proxy.jackparquez1.workers.dev/?u="
const IndexApi = "/home";
const recentapi = "/recent/";

// Api Server Manager

const AvailableServers = ['https://new.jackparquez1.workers.dev','https://api.jackparquez1.workers.dev','https://api1.jackparquez1.workers.dev']

function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)]
}

// Usefull functions

async function getJson(path, errCount = 0) {
    const ApiServer = getApiServer();
    let url = ApiServer + path;


    if (errCount > 5) {
        throw `Too many errors while fetching ${url}`;
    }

    if (errCount > 0) {
        // Retry fetch using proxy
        console.log("Retrying fetch using proxy");
        url = ProxyApi + url;
    }

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (errors) {
        console.error(errors);
        return getJson(path, errCount + 1);
    }
}

function genresToString(genres) {
    return genres.join(", ");
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
// Adding popular animes (popular animes from gogoanime)
async function getPopularAnimes(data) {
    let POPULAR_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        let anime = data[pos];
        let title = anime["title"];
        let id = anime["id"];
        let url = "./anime.html?anime_id=" + id;
        let image = anime["image"];
        let subOrDub;
        if (title.toLowerCase().includes("dub")) {
            subOrDub = "DUB";
        } else {
            subOrDub = "SUB";
        }

        POPULAR_HTML += `<a href="${url}"><div class="poster la-anime"> <div id="shadow1" class="shadow"><div class="dubb"># ${pos + 1
            }</div> <div class="dubb dubb2">${subOrDub}</div> </div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${image}"> </div><div class="la-details"> <h3>${title}</h3></div></div></a>`;
    }

    document.querySelector(".popularg").innerHTML = POPULAR_HTML;
}
// Adding popular animes (popular animes from gogoanime)
async function getRecentAnimes(page = 1) {
    const data = (await getJson(recentapi + page))["results"];
    let RECENT_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        let anime = data[pos];
        let title = anime["title"];
        let id = anime["id"].split("-episode-")[0];
        let url = "./anime.html?anime_id=" + id;
        let image = anime["image"];
        let ep = anime["episode"].split(" ")[1];
        let subOrDub;
        if (title.toLowerCase().includes("dub")) {
            subOrDub = "DUB";
        } else {
            subOrDub = "SUB";
        }

        RECENT_HTML += `<a href="${url}"><div class="poster la-anime"> <div id="shadow1" class="shadow"><div class="dubb">${subOrDub}</div><div class="dubb dubb2">EP ${ep}</div> </div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${image}"> </div><div class="la-details"> <h3>${title}</h3></div></div></a>`;
    }

    document.querySelector(".recento").innerHTML += RECENT_HTML;
}

async function RefreshLazyLoader() {
    const imageObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
            }
        });
    });
    const arr = document.querySelectorAll("img.lzy_img");
    arr.forEach((v) => {
        imageObserver.observe(v);
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// To load more animes when scrolled to bottom
let page = 2;
let isLoading = false;

async function loadAnimes() {
    try {
        if (isLoading == false) {
            isLoading = true;
            await getRecentAnimes(page)
            RefreshLazyLoader();
            console.log("Recent animes loaded");
            page += 1;
            isLoading = false;
        }
    } catch (error) {
        isLoading = false;
        console.error(`Failed To Load Recent Animes Page : ${page}`);
        page += 1;
    }
}

// Add a scroll event listener
window.addEventListener('scroll', function () {
    // Calculate how far the user has scrolled
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if ((scrollPosition + (3 * windowHeight)) >= documentHeight) {
        loadAnimes();
    }
});


// Running functions

getJson(IndexApi).then((data) => {
    data = data["results"];
    const anilistTrending = shuffle(data["anilistTrending"]);
    const gogoanimePopular = shuffle(data["gogoPopular"]);


    getPopularAnimes(gogoanimePopular).then((data) => {
        RefreshLazyLoader();
        console.log("Popular animes loaded");
    });

    getRecentAnimes(1).then((data) => {
        RefreshLazyLoader();
        console.log("Recent animes loaded");
    });
});
