    const apiKey = "AAPKcf6657caa7f74144a311b98a554379f9kmQpOXqXuMCgVIJq_laJ-mrTXEdINpc63jfsXfcJ9R_LnhT6x2MowKIV56mWXzu3";
    const apiKeyOS = "xRc1cIz3EEGzv01ir1QbM0Wj2hnwsQZG";

    const autoCompleteJS = new autoComplete({
              placeHolder: "Search for a street...",
              data: {
                  src: async (query) => {
                      try {
                          document.getElementById('autoComplete').setAttribute('placeholder', 'Loading...');
                          const request = await fetch(
                            `https://api.os.uk/search/places/v1/find?maxresults=10&output_srs=WGS84&fq=LOCAL_CUSTODIAN_CODE:2004&query=${query}&key=` + apiKeyOS
                          );
                          const data = await request.json();
                          document.getElementById("autoComplete").setAttribute('placeholder', autoCompleteJS.placeHolder);
                          const returnedResults = [];
                          data.results.forEach(result => {
                            returnedResults.push(result.DPA);
                          });
                          return returnedResults;
                      } catch (e) {
                          return e;
                      }
                  },
                  keys: ['ADDRESS']
              },
              resultsList: {
                  element: (list, data) => {
                      const info = document.createElement("p");
                      if (data.results.length > 0) {
                          info.innerHTML = `Displaying <strong>${data.results.length}</strong> out of <strong>${data.matches.length}</strong> results`;
                      } else {
                          info.innerHTML = `Found <strong>${data.matches.length}</strong> matching results for <strong>"${data.query}"</strong>`;
                      }
                      list.prepend(info);
                  },
              },
              cache: true,
              resultItem: {
                  highlight: true
              },
              events: {
                  input: {
                      selection: (event) => {
                          const searchLat = event.detail.selection.value.LAT, 
                          searchLng = event.detail.selection.value.LNG;
                          autoCompleteJS.input.value = event.detail.selection.value.ADDRESS;
                          initMap(searchLat,searchLng);
                          document.getElementById("mapReport").style.visibility = "visible";
                      }
                  }
              }
          });

    function initSearch() {
      document.getElementById("autoCompleteWrapper").style.visibility = "visible";
    }

    function initMap(searchLat, searchLng) {

      if (!document.getElementById("map")) {
        const mapDiv = document.createElement("div");
        mapDiv.id = "map";
        document.getElementById("mapReport").appendChild(mapDiv);
      }
        const defectMap = L.map("map", {
          minZoom: 2
        })

        defectMap.setView([searchLat, searchLng], 16, { animation: true });
        const basemapEnum = "6976148c11bd497d8624206f9ee03e30";

        L.esri.Vector.vectorBasemapLayer(basemapEnum, {
          apiKey: apiKey
        }).addTo(defectMap);

        const polygonGroup = L.esri.featureLayer({
          url: 'https://services8.arcgis.com/Bbftp6KbkQrwLFoE/arcgis/rest/services/Highways/FeatureServer/0',
          style: (feature) => {
            return {
              stroke: false,
              fillColor: "#4caf50", 
            };
          },
          onEachFeature: function (ev, layer) {
            layer.bindPopup("");
            layer.on("popupopen", function(e) {
              let popup = e.popup;
              const properties = popup._source.feature.properties;
              const latlng = popup.getLatLng();
            document.getElementById("formURL").value = "https://account.hull.gov.uk/service/highway_defects?lat="
              + latlng.lat
              + "&lng=" + latlng.lng
              + "&adoption=" + properties.Adoption
              + "&owner=" + properties.Owner
              + "&issue=" + document.querySelector('input[name="issue"]:checked').value;

            const formURL = document.getElementById("formURL").value;

            switch (properties.Owner) {
              case "Hull City Council":
                popup.setContent("<b>Report a highway defect at this location</b><br></br><a href='" + formURL + "'>Report it</a>");
                break;
              case "National Highways":
                popup.setContent("<b>Report a highway defect at this location</b><br></br><a href='https://report.nationalhighways.co.uk/'>Report it with National Highways</a>");
                break;
              default:
                popup.setContent("<b>Report a highway defect at this location</b><br></br><a href='" + formURL + "'>Report it</a>");
                break;
              }
            })

          }
        })
        .addTo(defectMap);
    }