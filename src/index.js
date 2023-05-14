import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('form#search-form');
const gallery = document.querySelector('div.gallery');
const moreBtn = document.querySelector('button.load-more');

const limitPerPage = 40;
let page = 1;
let searchValue = '';
let limitReached = false;

const params = new URLSearchParams({
  key: '36382362-abb3b9976eb1436b438e40306',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: limitPerPage,
});

const clearGallery = () => {
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }
};

const buildGallery = arr => {
  arr.forEach(el => {
    const {
      largeImageURL,
      webformatURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    } = el;
    const markup = `
  <div class="photo-card">
    <a href="${largeImageURL}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item"><b>Likes</b> ${likes}</p>
      <p class="info-item"><b>Views</b> ${views}</p>
      <p class="info-item"><b>Comments</b> ${comments}</p>
      <p class="info-item"><b>Downloads</b> ${downloads}</p>
    </div>
  </div>
`;
    gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
  });
};

const disableBtn = () => {
  moreBtn.classList.add('hidden');
};
const enableBtn = () => {
  moreBtn.classList.remove('hidden');
};

const fetchImg = async (search, page) => {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?${params}&q=${search}&page=${page}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data);
  }
};

const searchImg = async event => {
  event.preventDefault();
  page = 1;
  limitReached = false;
  searchValue = event.target[0].value;
  clearGallery();

  try {
    const arr = await fetchImg(searchValue);
    if (arr.hits.length === 0) {
      disableBtn();
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found ${arr.totalHits} images.`);
      buildGallery(arr.hits);
      page++;
      limitReached = arr.totalHits < limitPerPage;
      enableBtn();
    }
  } catch (error) {
    Notify.failure(error.response.data);
  }
};

const loadMore = async () => {
  try {
    const { hits, totalHits } = await fetchImg(currentSearchValue, page);
    buildGallery(hits);
    page++;
    limitReached = page * limitPerPage > totalHits;
    if (limitReached) {
      Notify.info(`We're sorry, but you've reached the end of search results.`);
      disableBtn();
    }
  } catch (error) {
    Notify.failure(error.response.data);
  }
};
searchForm.addEventListener('submit', searchImg);
moreBtn.addEventListener('click', loadMore);

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: false,
  showCounter: false,
});
