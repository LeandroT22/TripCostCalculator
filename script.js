
        let map;
        let directionsService;
        let directionsRenderer;
        let originAutocomplete;
        let destinationAutocomplete;
        
        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: -34.8948, lng: -56.1702},
                zoom: 12
            });
            
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
            
            // Autocompletado para campos de origen y destino
            originAutocomplete = new google.maps.places.Autocomplete(
                document.getElementById('origin'),
                { types: ['geocode'] }
            );
            
            destinationAutocomplete = new google.maps.places.Autocomplete(
                document.getElementById('destination'),
                { types: ['geocode'] }
            );
            
            document.getElementById('calculateTrip').addEventListener('click', calculateRoute);
            document.getElementById('calculateRoundTrip').addEventListener('click', calculateRoundTrip);
        }
        
        function calculateRoute() {
            const origin = document.getElementById('origin').value;
            const destination = document.getElementById('destination').value;
            
            if (!origin || !destination) {
                alert('Por favor, completa ambos campos de origen y destino');
                return;
            }
            
            directionsService.route(
                {
                    origin: origin,
                    destination: destination,
                    travelMode: 'DRIVING',
                    unitSystem: google.maps.UnitSystem.METRIC,
                    provideRouteAlternatives: false,
                    drivingOptions: {
                        departureTime: new Date(),
                        trafficModel: 'bestguess'
                    },
                },
                (response, status) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(response);
                        displayResults(response);
                    } else {
                        alert('No se pudo calcular la ruta: ' + status);
                    }
                }
            );
        }
        
// Convierte un string tipo "1 h 30 min" a minutos
function durationTextToMinutes(durationText) {
    let totalMinutes = 0;
    const hourMatch = durationText.match(/(\d+)\s*h/);
    const minMatch = durationText.match(/(\d+)\s*min/);
    if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
    return totalMinutes;
}

// Convierte minutos a string tipo "X h Y min"
function minutesToDurationText(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h} h ${m} min`;
    if (h > 0) return `${h} h`;
    return `${m} min`;
}

function displayResults(directionsResult, isRoundTrip = false) {
    const route = directionsResult.routes[0];
    const distance = route.legs[0].distance.text;
    const duration = route.legs[0].duration.text;

    // Extraer distancia en km (removiendo " km")
    const distanceKm = parseFloat(distance.split(' ')[0].replace(',', '.'));

    // Calcular valores
    const fuelConsumption = 10; // km/l
    const fuelPrice = 78; // $/l
    const tollPrice = 152; // $/peaje

    const fuelNeeded = distanceKm / fuelConsumption;
    const fuelCost = fuelNeeded * fuelPrice;

    // Buscar peajes en los pasos de la ruta
    let tollCount = 0;
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            if (
                (step.instructions && step.instructions.toLowerCase().includes('peaje'))
            ) {
                tollCount++;
            }
        });
    });

    // Si es ida y vuelta, duplicar valores
    const multiplier = isRoundTrip ? 2 : 1;

    const totalDistance = distanceKm * multiplier;
    const totalFuelNeeded = fuelNeeded * multiplier;
    const totalFuelCost = fuelCost * multiplier;
    const totalTollCount = tollCount * multiplier;
    const totalTollCost = tollCount * tollPrice * multiplier;
    const totalCost = totalFuelCost + totalTollCost;

    // Calcular duración total si es ida y vuelta
    let totalDurationText = duration;
    if (isRoundTrip) {
        const totalMinutes = durationTextToMinutes(duration) * 2;
        totalDurationText = minutesToDurationText(totalMinutes);
    }

    // Mostrar resultados
    document.getElementById('distance').textContent = totalDistance.toFixed(1) + ' km';
    document.getElementById('duration').textContent = totalDurationText;
    document.getElementById('fuel').textContent = totalFuelNeeded.toFixed(1) + ' l';
    document.getElementById('fuel-cost').textContent = '$' + totalFuelCost.toFixed(0);
    document.getElementById('total-cost').textContent = '$' + totalCost.toFixed(0);
    document.getElementById('toll-count').textContent = totalTollCount;
    document.getElementById('toll-cost').textContent = '$' + totalTollCost.toFixed(0);

    document.getElementById('results').classList.remove('hidden');
}

let isRoundTrip = true; // Estado inicial: ida y vuelta

function calculateRoundTrip() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const btn = document.getElementById('calculateRoundTrip');

    if (!origin || !destination) {
        alert('Por favor, completa ambos campos de origen y destino');
        return;
    }

    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.METRIC,
            provideRouteAlternatives: false,
            drivingOptions: {
                departureTime: new Date(),
                trafficModel: 'bestguess'
            },
        },
        (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
                displayResults(response, isRoundTrip);
                // Alternar estado y texto del botón
                isRoundTrip = !isRoundTrip;
                btn.textContent = isRoundTrip ? 'Ida y vuelta' : 'Solo ida';
            } else {
                alert('No se pudo calcular la ruta: ' + status);
            }
        }
    );
}
        
        // Inicializar mapa cuando la API esté cargada
        window.onload = function() {
            initMap();
        };