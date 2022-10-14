const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = JSON.parse(localStorage.getItem('favoriteMovie')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')


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

function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


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
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="image-fluid">`
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
  })
}


function renderMovieList (data) {
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
                    <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
                  </div>
                </div>
              </div>
            </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 移除收藏的電影
function removeFromFavorite(id) {
  if (!movies || !movies.length) return 

  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovie', JSON.stringify(movies))
  renderMovieList(movies)
}

// 按下 more / X
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

renderPaginator(movies.length)
renderMovieList(getMoviesByPage(1))