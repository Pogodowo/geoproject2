const cardsContainer=document.getElementById('cards')
const csrf = document.getElementsByName('csrfmiddlewaretoken')

//-----------funkcja do wyświetlania punktów-----------
function fetchPoints(mymap){
    // Add GeoJSON layer to the map
    fetch('http://localhost:8000/places_data/')
        .then(response => response.json())
        .then(data => {
            const geoJSONLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng);
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties) {
                        layer.bindPopup(
                            'Country: ' + feature.properties.country + '<br>' +
                            'City: ' + feature.properties.city
                        );
                    }
                }
            });

            geoJSONLayer.addTo(mymap);
        })
        .catch(error => {
            console.error('Error fetching GeoJSON data:', error);
        });}
//--------kopia funkcji do wyświetlania śladów----------
let trackLayers = {}
// Function to display a collection of GPX tracks
function displayGPXTracks(trackCollection,mymap) {
        trackCollection.features.forEach((track, index) => {
            const color = track.properties.color ||'#000000';  // Generate a random color for each track
            const geoJSONLayer = L.geoJSON(track, {
                ///////////////////////////////////////////////
                onEachFeature: function (feature, layer) {
            // Add mouseover event listener to display information
             layer.on('mouseover', function (e) {
            // Access feature properties to display information
            var info = feature.properties.name; // Change this to access your track's information
            // Use a tooltip to display brief information on hover
            layer.bindTooltip(info).openTooltip();
        });
         // Add click event listener to trigger a function
        layer.on('click', function (e) {
            // Trigger your JavaScript function here
            editTrack(feature.properties.pk)
            // Pass the feature or any necessary data to your function
        });
        },
                /////////////////////////////////////////////////
                style: {
                    color: color,
                },
            });
            //----------potrzebne do usunięcia trasy
            //console.log('track',track.id)
             //let track.features[0].properties.name
             const trackID = track.id; // Generating unique ID for each track
             trackLayers[trackID] = geoJSONLayer;
             //-------------koniec potrzebnych dp usunięcia mapy
            geoJSONLayer.addTo(mymap);
        });

    }

function creatingCard(trackCollection){
cardsContainer.innerHTML='';
trackCollection.features.forEach((track, index) => {
const card=document.createElement('div')
card.className='card'
const par=document.createElement('p')
par.textContent=`${track.properties.name}`
//card.textContent=`${track.properties.name}`
cardsContainer.appendChild(card)
card.appendChild(par)
const editButton=document.createElement('button')
editButton.setAttribute('class',"edit")
editButton.setAttribute('onclick',`editTrack(${track.id})`)
editButton.setAttribute('data-toggle',"modal")
editButton.setAttribute('data-target',"#myModal")
editButton.textContent='Edytuj'

const deleteButton=document.createElement('button')
deleteButton.setAttribute('class',"delete")
deleteButton.setAttribute('onclick',`deleteTrack(${track.id})`)
deleteButton.textContent='Usuń'
const span=document.createElement('span')
span.appendChild(editButton)
span.appendChild(deleteButton)
card.appendChild(span)

//<button class="edit" onclick="editTrack({{track.pk}})" data-toggle="modal" data-target="#myModal"> edytuj</button>
//<button class="delete" onclick="deleteTrack({{track.pk}})">usuń</button>




})

}

function fetchTracks(mymap){
fetch('http://localhost:8000/tracks/tracks_data/')  // Replace with your actual Django view URL
    .then(response => response.json())
    .then(trackCollection => {
        //console.log('co jest?')
        console.log('Received GPX track collection:', trackCollection);
        console.log('trackLayers',trackLayers)
        displayGPXTracks(trackCollection,mymap);
        creatingCard(trackCollection)
    })
    .catch(error => {
        console.error('Error fetching GPX track collection:', error);
    });
    }
    // Function to generate random color (for demonstration purposes)
//---------koniec finkcji do wyświetlania śladów--------------

window.onload=init

const mymap=L.map('map',{
        center:[52,19],
        zoom: 6,
        layers:[
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
            attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
        ]
    })

function init(){


//fetchPoints(mymap)
fetchTracks(mymap)
      /////////////////////////end tracks//////////////////////////////////////////////////
}

///////////////dodawanie  trasy/////////////////////////////////////////



/////////////kolejne podejście----------------------------------------------
document.getElementById('uploadForm').addEventListener('submit', handleSubmit)

function handleSubmit(event){

 const form = event.currentTarget;
  const url = new URL(form.action);
  const formData = new FormData(form);
  const searchParams = new URLSearchParams(formData);
  const fetchOptions = {
  method: form.method,
   body: formData,
   };

   if (form.method.toLowerCase() === 'post') {
    if (form.enctype === 'multipart/form-data') {
      fetchOptions.body = formData;
    } else {
      fetchOptions.body = searchParams;
    }
  } else {
    url.search = searchParams;
  }

  fetch(url,fetchOptions)
   .then(() => {
      // Refresh the map only after the form submission is successful
      fetchTracks(mymap);
    })
    .catch(error => {
      console.error('Error submitting form:', error);
    });

event.preventDefault();
}


//----------sidebar----------
const sideBarButton = document.getElementById('side-bar-button');
 const gridContainer = document.querySelector('.grid-container');
    const sidebar = document.getElementById('sidebar');
   const map = document.getElementById('map');

    sideBarButton.addEventListener('click', function () {
        sidebar.classList.toggle('hidden');
       // map.classList.toggle('hidden-sidebar');
        if (sidebar.classList.contains('hidden')) {
            gridContainer.style.gridTemplateColumns = '0px 1fr'; // Collapse sidebar to 0px width
            map.classList.remove('hidden-sidebar');
        } else {
            gridContainer.style.gridTemplateColumns = '280px 1fr'; // Revert sidebar width
            map.classList.add('hidden-sidebar');
        }

    });

let editModal;

function editTrack(pk){
console.log('pk',pk)
const myModal=document.getElementById('exampleModal')
editModal = new bootstrap.Modal(myModal);
  editModal.show();
 fetch(`/tracks/edytuj_trase_form/${pk}`)
   .then(
      response=> response.json()
    )
    .then(data => {
      console.log('Retrieved data:', data);
      // Assuming 'name' is a key in the returned JSON data
      console.log('data.name:', data.features[0].properties.name,Object.keys(data));
      document.getElementById("exampleModalLabel").textContent=data.features[0].properties.name
      document.getElementById("name-edit").value=data.features[0].properties.name
      const myColor=data.features[0].properties.color
      const colorElement=document.getElementById("track-color-edit")
      colorElement.jscolor.fromString(myColor)
      document.getElementById("track-color-edit").value=data.features[0].properties.color
      editButton=document.getElementById('save-changes')
      const closeModalButton=document.getElementById('close-edit-modal')
      closeModalButton.addEventListener('click',()=>{editModal.hide()})
      const editForm=document.getElementById("uploadEditForm")
      editForm.addEventListener('submit', saveChanges)
      editForm.setAttribute('action',`/tracks/save_changes/${pk}/`)
      editForm.setAttribute('name',`${pk}`)
      document.getElementById('x-button').addEventListener('click',()=>editModal.hide())
    })
    .catch(error => {
      console.error('Error submitting form:', error);
    });


}

function saveChanges(event){
event.preventDefault();
//console.log('działa przycisk edycji',pk)
const form = event.currentTarget;
  const url = new URL(form.action);
  const formData = new FormData(form);
  const searchParams = new URLSearchParams(formData);
  const fetchOptions = {
  method: form.method,
   body: formData,
   };

   if (form.method.toLowerCase() === 'post') {
    if (form.enctype === 'multipart/form-data') {
      fetchOptions.body = formData;
    } else {

      fetchOptions.body = searchParams;
    }
  } else {
    url.search = searchParams;
  }
   editModal.hide();
  fetch(url,fetchOptions)
   .then(() => {
      ////////////
      if (trackLayers.hasOwnProperty(form.name)) {
        mymap.removeLayer(trackLayers[form.name]); // Removing the specific track layer
        delete trackLayers[form.name]; // Removing the reference from the tracking object
    } else {
        console.error('Track ID not found:', form.name);
    }
      //////////////
      fetchTracks(mymap);

    })
    .catch(error => {
      console.error('Error submitting form:', error);
    });

event.preventDefault();
}

let delModal

function deleteTrack(pk){
    const deleteModal=document.getElementById('deleteModal')
delModal = new bootstrap.Modal(deleteModal);
  delModal.show();
  const deleteConfirmButton=document.getElementById("confirm-delete-button")
  deleteConfirmButton.setAttribute('onclick',`confirmDelete(${pk})`
  //()=>{location.href(`delete_track/${pk}/`) }

  )
}
function confirmDelete(pk) {
const csrftoken = getCookie('csrftoken');
  fetch(`/tracks/delete_track/${pk}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken // Include CSRF token in the header
      // Add any other headers if required
    },
  })
  .then(response => {
    if (response.ok) {
      // Optional: Handle success message or UI update
      console.log('Track deleted successfully');
      fetchTracks(mymap);
      removeTrackFromMap(pk, mymap)
      delModal.hide();
      // Optional: Hide the deleted track from the UI
    } else {
      console.error('Failed to delete track');
    }
  })
  .catch(error => {
    console.error('Error deleting track:', error);
  });
}
//function confirmDelete(pk){
//
//window.location.href=`tracks/delete_track/${pk}/`
//}


function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Check if cookie name matches the CSRF token name
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function removeTrackFromMap(trackID, mymap) {
    console.log('trackLayers',trackLayers)
    if (trackLayers.hasOwnProperty(trackID)) {
        mymap.removeLayer(trackLayers[trackID]); // Removing the specific track layer
        delete trackLayers[trackID]; // Removing the reference from the tracking object
    } else {
        console.error('Track ID not found:', trackID);
    }
}