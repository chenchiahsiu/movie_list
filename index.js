const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 判斷要建幾個分頁數字
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 第幾頁放哪些電影
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// more 要顯示的內容 (串接 API 資料讀取電影詳細資訊)
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
    })
}

// 在畫面上產生 Movie List
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
              <div class="mb-2">
                <div class="card">
                  <img
                    src="${POSTER_URL + item.image}"
                    class="card-img-top" alt="Movie Poster" />
                  <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                  </div>
                  <div class="card-footer">
                    <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                      data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                    <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                  </div>
                </div>
              </div>
            </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 加到收藏清單的電影會儲存在 localStorage
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovie')) || []

  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中!')
  }
  list.push(movie)

  localStorage.setItem('favoriteMovie', JSON.stringify(list))
}

// 按下 more / +
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 按下分頁數字
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

// 按下 Search 搜尋電影
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   alert('Please enter a valid string.')
  // }

  // filter 把篩選到的放進陣列
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with: ' + keyword)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))