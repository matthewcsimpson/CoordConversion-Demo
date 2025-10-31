// Global variables
let map;
let markers = {
  input: null,
  dd: null,
  dm: null,
  dms: null,
};

const defaultPrecision = 5;

/**
 * Checks if the given latitude and longitude are valid coordinates.
 * @param {*} lat
 * @param {*} lng
 * @returns {boolean} True if valid, false otherwise.
 */
const isValidCoordinate = (lat, lng) => {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Initialize and add the map
const initMap = () => {
  // Default location (Salt Spring Island)
  const defaultLocation = [48.816662, -123.508873];

  // Create the map with OpenStreetMap tiles
  map = L.map("map").setView(defaultLocation, 18);

  // Add OpenStreetMap tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Create custom icons for different marker types
  const redIcon = L.divIcon({
    className: "custom-div-icon",
    html: "<div style='background-color:red;width:12px;height:12px;border-radius:50%;border:2px solid white;'></div>",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const greenIcon = L.divIcon({
    className: "custom-div-icon",
    html: "<div style='background-color:green;width:12px;height:12px;border-radius:50%;border:2px solid white;'></div>",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const orangeIcon = L.divIcon({
    className: "custom-div-icon",
    html: "<div style='background-color:orange;width:12px;height:12px;border-radius:50%;border:2px solid white;'></div>",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const blueIcon = L.divIcon({
    className: "custom-div-icon",
    html: "<div style='background-color:blue;width:12px;height:12px;border-radius:50%;border:2px solid white;'></div>",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  // Create initial markers for each format
  markers.input = L.marker(defaultLocation, {
    icon: redIcon,
    title: "Browser Location",
  }).addTo(map);

  markers.dd = L.marker(defaultLocation, {
    icon: greenIcon,
    title: "DD Format",
  }).addTo(map);

  markers.dm = L.marker(defaultLocation, {
    icon: orangeIcon,
    title: "DM Format",
  }).addTo(map);

  markers.dms = L.marker(defaultLocation, {
    icon: blueIcon,
    title: "DMS Format",
  }).addTo(map);

  // Set up form event listener
  document.getElementById("coordinateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const lat = parseFloat(document.getElementById("latitude").value);
    const lng = parseFloat(document.getElementById("longitude").value);

    if (isValidCoordinate(lat, lng)) {
      updateMapLocation(lat, lng, "Custom location");
    } else {
      alert(
        "Please enter valid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180."
      );
    }
  });

  // Set up current location button
  document
    .getElementById("currentLocationBtn")
    .addEventListener("click", () => {
      getCurrentLocation();
    });

  // Set up toggle event listeners
  document.getElementById("inputToggle").addEventListener("change", () => {
    if (this.checked) {
      markers.input.addTo(map);
    } else {
      map.removeLayer(markers.input);
    }
  });

  document.getElementById("ddToggle").addEventListener("change", () => {
    if (this.checked) {
      markers.dd.addTo(map);
    } else {
      map.removeLayer(markers.dd);
    }
  });

  document.getElementById("dmToggle").addEventListener("change", () => {
    if (this.checked) {
      markers.dm.addTo(map);
    } else {
      map.removeLayer(markers.dm);
    }
  });

  document.getElementById("dmsToggle").addEventListener("change", () => {
    if (this.checked) {
      markers.dms.addTo(map);
    } else {
      map.removeLayer(markers.dms);
    }
  });

  // Set up precision control event listeners
  document.getElementById("ddPrecision").addEventListener("change", () => {
    const lat = parseFloat(document.getElementById("latitude").value);
    const lng = parseFloat(document.getElementById("longitude").value);
    if (isValidCoordinate(lat, lng)) {
      updateMapLocation(lat, lng, "Updated precision");
    }
  });

  document.getElementById("dmPrecision").addEventListener("change", () => {
    const lat = parseFloat(document.getElementById("latitude").value);
    const lng = parseFloat(document.getElementById("longitude").value);
    if (isValidCoordinate(lat, lng)) {
      updateMapLocation(lat, lng, "Updated precision");
    }
  });

  document.getElementById("dmsPrecision").addEventListener("change", () => {
    const lat = parseFloat(document.getElementById("latitude").value);
    const lng = parseFloat(document.getElementById("longitude").value);
    if (isValidCoordinate(lat, lng)) {
      updateMapLocation(lat, lng, "Updated precision");
    }
  });

  // Try to get current location on page load
  getCurrentLocation();
};

const updateMapLocation = (lat, lng) => {
  const inputLocation = [lat, lng];

  // Update map center to input coordinates
  map.setView(inputLocation, 18);

  // Update form fields
  document.getElementById("latitude").value = lat.toFixed(5);
  document.getElementById("longitude").value = lng.toFixed(5);

  // Display input coordinates
  document.getElementById("inputDisplay").textContent = `${lat.toFixed(
    5
  )}, ${lng.toFixed(5)}`;

  // Update input marker (red)
  markers.input.setLatLng(inputLocation);
  markers.input.bindTooltip(
    `Browser Location (DD): ${lat.toFixed(5)}, ${lng.toFixed(5)}`
  );
  if (document.getElementById("inputToggle").checked) {
    markers.input.addTo(map);
  }

  // Convert to DD format using coordconversion library
  try {
    // Parse the numeric input to DD objects, then format for display
    const [latDD, lonDD] = CoordConversion.parsePairToDD(lat, lng);
    const ddPrecision =
      parseInt(document.getElementById("ddPrecision").value) ||
      defaultPrecision;
    const [latStrDD, lonStrDD] = CoordConversion.formatDDPair(
      latDD,
      lonDD,
      ddPrecision
    );
    document.getElementById(
      "ddDisplay"
    ).textContent = `${latStrDD}, ${lonStrDD}`;

    // Convert the FORMATTED strings back to DD objects to apply precision loss
    const [latDDPrecise, lonDDPrecise] = CoordConversion.parsePairToDD(
      latStrDD,
      lonStrDD
    );
    const ddLocation = [latDDPrecise.degrees, lonDDPrecise.degrees];
    markers.dd.setLatLng(ddLocation);
    markers.dd.bindTooltip(
      `DD: ${latStrDD}, ${lonStrDD} (Converted back: ${latDDPrecise.degrees.toFixed(
        8
      )}, ${lonDDPrecise.degrees.toFixed(8)})`
    );
    if (document.getElementById("ddToggle").checked) {
      markers.dd.addTo(map);
    }
  } catch (error) {
    console.error("Error converting coordinates to DD format:", error);
    document.getElementById("ddDisplay").textContent = "Conversion error";
  }

  // Convert to DM format using coordconversion library
  try {
    // Use the streamlined workflow with precision options
    const [latDD, lonDD] = CoordConversion.parsePairToDD(lat, lng);
    const dmPrecision = Math.max(
      1,
      parseInt(document.getElementById("dmPrecision").value) || defaultPrecision
    );

    // Apply precision during conversion using function options
    const [latDM, lonDM] = CoordConversion.ddPairToDM(latDD, lonDD, {
      decimals: dmPrecision,
    });
    const [latStrDM, lonStrDM] = CoordConversion.formatDMPair(
      latDM,
      lonDM,
      dmPrecision
    );

    document.getElementById(
      "dmDisplay"
    ).textContent = `${latStrDM}, ${lonStrDM}`;

    // Convert DM back to DD for mapping to SHOW THE DRIFT from precision loss
    const [dmLatObj, dmLngObj] = CoordConversion.dmPairToDD(latDM, lonDM);
    const dmLocation = [dmLatObj.degrees, dmLngObj.degrees];

    markers.dm.setLatLng(dmLocation);
    markers.dm.bindTooltip(
      `DM: ${latStrDM}, ${lonStrDM} (Converted back: ${dmLatObj.degrees.toFixed(
        8
      )}, ${dmLngObj.degrees.toFixed(8)})`
    );
    if (document.getElementById("dmToggle").checked) {
      markers.dm.addTo(map);
    }
  } catch (error) {
    console.error("Error converting coordinates to DM format:", error);
    document.getElementById("dmDisplay").textContent = "Conversion error";
  }

  // Convert to DMS format using coordconversion library
  try {
    // Use the streamlined workflow with precision options
    const [latDD, lonDD] = CoordConversion.parsePairToDD(lat, lng);
    const dmsPrecision = Math.max(
      1,
      parseInt(document.getElementById("dmsPrecision").value) ||
        defaultPrecision
    );

    // Apply precision during conversion using function options
    const [latDMS, lonDMS] = CoordConversion.ddPairToDMS(latDD, lonDD, {
      decimals: dmsPrecision,
    });
    const [latStrDMS, lonStrDMS] = CoordConversion.formatDMSPair(
      latDMS,
      lonDMS,
      dmsPrecision
    );

    document.getElementById(
      "dmsDisplay"
    ).textContent = `${latStrDMS}, ${lonStrDMS}`;

    // Convert DMS back to DD for mapping to SHOW THE DRIFT from precision loss
    const [dmsLatObjPrecise, dmsLngObjPrecise] = CoordConversion.dmsPairToDD(
      latDMS,
      lonDMS
    );
    const dmsLocation = [dmsLatObjPrecise.degrees, dmsLngObjPrecise.degrees];
    markers.dms.setLatLng(dmsLocation);
    markers.dms.bindTooltip(
      `DMS: ${latStrDMS}, ${lonStrDMS} (Converted back: ${dmsLatObjPrecise.degrees.toFixed(
        8
      )}, ${dmsLngObjPrecise.degrees.toFixed(8)})`
    );
    if (document.getElementById("dmsToggle").checked) {
      markers.dms.addTo(map);
    }
  } catch (error) {
    console.error("Error converting coordinates to DMS format:", error);
    document.getElementById("dmsDisplay").textContent = "Conversion error";
  }
};

const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateMapLocation(lat, lng, "Your current location");
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your current location. Error: " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

// Initialize the map when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initMap();
});
