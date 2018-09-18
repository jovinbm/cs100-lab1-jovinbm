const API_KEY = "70433350-bafb-11e8-88c5-811c39b2c016";

function loadHashPage(hash) {
  if (/gallery-([0-9]{1,})/.test(hash)) {
    const galleryId = Number(/gallery-([0-9]{1,})/.exec(hash)[1])
    showObjectsTable(galleryId);
  } else if (/object-([0-9]{1,})/.test(hash)) {
    const objectId = Number(/object-([0-9]{1,})/.exec(hash)[1])
    showObject(objectId);
  } else {
    showGalleriesTable();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadHashPage(window.location.hash);
  window.onhashchange = (event) => {
    const newHash = event.target.location.hash;
    loadHashPage(newHash);
  }
});

function showGalleries(page = 1) {
  function renderGalleries(data) {
    data.records.forEach(gallery => {
      document.querySelector("#galleries").innerHTML += `
        <li>
          <a href="#gallery-${gallery.id}">
            Gallery #${gallery.id}: ${gallery.name} (Floor ${gallery.floor})
          </a>
        </li>
      `;
    });
    if (data.info.next) {
      const nextPage = ++data.info.page;
      if (nextPage <= 100) {
        showGalleries(nextPage);
      }
    }
  }
  const localStorageIdentifier = `galleries-${page}`;
  const objectFromLocalStorage = window.localStorage.getItem(localStorageIdentifier);
  if (objectFromLocalStorage) {
    renderGalleries(JSON.parse(objectFromLocalStorage));
  } else {
    fetch(`https://api.harvardartmuseums.org/gallery?apikey=${API_KEY}&page=${page}`)
      .then(response => response.json())
      .then(data => {
        window.localStorage.setItem(localStorageIdentifier, JSON.stringify(data));
        renderGalleries(data)
      })
  }
}

function getObjectsForGallery(galleryNumber, page = 1) {
  function renderObjects(data) {
    if (data.records.length === 0) {
      document.querySelector("#objects").innerHTML += '<p>This gallery has no objects.</p>'
    }
    data.records.forEach(object => {
      const image = object.primaryimageurl ?
        `<img src="${object.primaryimageurl}?height=150&width=150"/>` :
        '<p>(No image)</p>';
      let people = ''
      if (object.people && object.people.length > 0) {
        people += `<ul>`
        object.people.map(person => {
          people += `<li>${person.name}</li>`
        })
        people += `</ul>`
      } else {
        people = '<p>(No people)</p>'
      }
      document.querySelector("#objects").innerHTML += `
        <li>
          <div>
            <p>Title: <a href="#object-${object.id}">${object.title}</a></p>
          </div>
          <div>
            <p>Image:</p>
            ${image}
          </div>
          <div>
            <p>People:</p>
            ${people}
          </div>
          <div>
            <p>Harvard Art Museums Link: <a href=${object.url} target="_blank">${object.url}</a></p>
          </div>
        </li>
      `;
    });
    if (data.info.next) {
      const nextPage = ++data.info.page;
      if (nextPage <= 30) {
        return getObjectsForGallery(galleryNumber, nextPage);
      }
    }
  }
  const localStorageIdentifier = `gallery-${galleryNumber}-${page}`;
  const objectFromLocalStorage = window.localStorage.getItem(localStorageIdentifier);
  if (objectFromLocalStorage) {
    renderObjects(JSON.parse(objectFromLocalStorage));
  } else {
    fetch(`https://api.harvardartmuseums.org/object?apikey=${API_KEY}&gallery=${galleryNumber}&page=${page}`)
      .then(response => response.json())
      .then(data => {
        window.localStorage.setItem(localStorageIdentifier, JSON.stringify(data));
        renderObjects(data);
      })
  }
}

function getObject(objectId) {
  function renderObject(object) {
    const image = object.primaryimageurl ?
      `<img src="${object.primaryimageurl}?height=150&width=150"/>` :
      '<p>(No image)</p>';
    let people = ''
    if (object.people && object.people.length > 0) {
      people += `<ul>`
      object.people.map(person => {
        people += `<li>${person.name}</li>`
      })
      people += `</ul>`
    } else {
      people = '<p>(No people)</p>'
    }
    document.querySelector("#object").innerHTML += `
        <div>
          <p>Title: ${object.title}</p>
        </div>
        <div>
          <p>Description: ${object.description || 'No description'}</p>
        </div>
        <div>
          <p>Provenance: ${object.provenance || 'No provenance'}</p>
        </div>
        <div>
          <p>Accession Year: ${object.accessionyear || 'No accession year'}</p>
        </div>
        <div>
          <p>Image:</p>
          ${image}
        </div>
        <div>
          <p>People:</p>
          ${people}
        </div>
        <div>
          <p>Harvard Art Museums Link: <a href=${object.url} target="_blank">${object.url}</a></p>
        </div>
      `;
  }
  const localStorageIdentifier = `object-${objectId}`;
  const objectFromLocalStorage = window.localStorage.getItem(localStorageIdentifier);
  if (objectFromLocalStorage) {
    renderObject(JSON.parse(objectFromLocalStorage));
  } else {
    return fetch(`https://api.harvardartmuseums.org/object/${objectId}?apikey=${API_KEY}`)
      .then(response => response.json())
      .then(object => {
        window.localStorage.setItem(localStorageIdentifier, JSON.stringify(object));
        renderObject(object);
      });
  }
}

function showGalleriesTable() {
  document.querySelector("#galleries").innerHTML = '';
  showGalleries()
  document.querySelector("#all-galleries").style.display = "block";
  document.querySelector("#all-objects").style.display = "none";
  document.querySelector("#one-object").style.display = "none";
}

function showObjectsTable(id) {
  document.querySelector("#objects").innerHTML = '';
  getObjectsForGallery(id)
  document.querySelector("#all-galleries").style.display = "none";
  document.querySelector("#all-objects").style.display = "block";
  document.querySelector("#one-object").style.display = "none";
}

function showObject(id) {
  document.querySelector("#object").innerHTML = '';
  getObject(id)
  document.querySelector("#all-galleries").style.display = "none";
  document.querySelector("#all-objects").style.display = "none";
  document.querySelector("#one-object").style.display = "block";
}
