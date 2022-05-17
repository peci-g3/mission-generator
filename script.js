const containers = document.querySelectorAll('.container')

function init() {
	document.querySelector('#commands').innerHTML = `
		<div class="draggable assign" draggable="true">
			assign
		</div>

		<div class="draggable arm" draggable="true">
			arm
		</div>

		<div class="draggable take-off" draggable="true">
			take off
			<input type="number" name="m" id="m" value="3" min="0" required>
			meters
		</div>

		<div class="draggable move" draggable="true">
			move
			<input type="number" name="m" id="m" value="10" min="0" required>
			meters
			<select name="p" id="p" required>
				<option value="forward">forward</option>
				<option value="backwards">backwards</option>
				<option value="left">left</option>
				<option value="right">right</option>
			</select>
			with speed of
			<input type="number" name="s" id="s" value="5" min="0" required>
			m/s
		</div>

		<div class="draggable go-to" draggable="true">
			go to
			coordinates
			<input type="text" name="coords" id="coords" value="40.63493931 , -8.65992687" style="width: 280px;" required readonly>
			with speed of
			<input type="number" name="s" id="s" value="5" min="0" required>
			m/s
		</div>

		<div class="draggable rotate-deg" draggable="true">
			rotate
			<input type="number" name="d" id="d" value="45" min="0" required>
			degrees
		</div>

		<div class="draggable rotate-card" draggable="true">
			rotate
			<select name="c" id="c" required>
				<option value="north">north</option>
				<option value="south">south</option>
				<option value="east">east</option>
				<option value="west">west</option>
			</select>
		</div>

		<div class="draggable land" draggable="true">
			land
		</div>

		<div class="draggable home" draggable="true">
			home
		</div>

		<div class="draggable repeat" draggable="true" style="background-color: #ddd;">
			begin repeat
			<input type="number" name="t" id="t" value="4" min="2" required>
			times {
		</div>

		<div class="draggable end" draggable="true" style="background-color: #ddd;">
			} end repeat
		</div>
	`

	draggables = document.querySelectorAll('.draggable')

	draggables.forEach(draggable => {
		draggable.addEventListener('dragstart', () => {
			draggable.classList.add('dragging')
		})

		draggable.addEventListener('dragend', () => {
			draggable.classList.remove('dragging')
			init()
		})
	})
}

init()

containers.forEach(container => {
	container.addEventListener('dragover', e => {
		e.preventDefault()
		const afterElement = getDragAfterElement(container, e.clientY)
		const draggable = document.querySelector('.dragging')
		if (afterElement == null) {
			container.appendChild(draggable)
		} else {
			container.insertBefore(draggable, afterElement)
		}
	})
})

function getDragAfterElement(container, y) {
	const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

	return draggableElements.reduce((closest, child) => {
		const box = child.getBoundingClientRect()
		const offset = y - box.top - box.height / 2
		if (offset < 0 && offset > closest.offset) {
			return { offset: offset, element: child }
		} else {
			return closest
		}
	}, { offset: Number.NEGATIVE_INFINITY }).element
}

function hasClass(element, className) {
	return ('' + element.className + '').indexOf('' + className + '') > -1
}

function generateMission(exportData, exportName) {
	var dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportData)
	var downloadAnchor = document.createElement('a')
	downloadAnchor.setAttribute('href', dataStr)
	downloadAnchor.setAttribute('download', exportName + '.groovy')
	document.body.appendChild(downloadAnchor)
	downloadAnchor.click()
	downloadAnchor.remove()
}

document.querySelector('#generator').addEventListener('submit', function (e) {
	e.preventDefault()

	var text
	var result = ''
	var commands = document.querySelectorAll('#timeline > .draggable')

	// Error: empty timeline
	if (commands.length <= 0) {
		alert('Could not generate mission file, because timeline is empty!')
		return false
	}

	// Error: "assign" command not found
	if (!commands[0] || !hasClass(commands[0], 'assign')) {
		alert('Could not generate mission file, because the first command of the timeline must be "assign"!')
		return false
	}

	// Error: "arm" command not found
	if (!commands[1] || !hasClass(commands[1], 'arm')) {
		alert('Could not generate mission file, because the second command of the timeline must be "arm"!')
		return false
	}

	// Error: "take off" command not found
	if (!commands[2] || !hasClass(commands[2], 'take-off')) {
		alert('Could not generate mission file, because the third command of the timeline must be "take off"!')
		return false
	}

	// Error: "land" or "home" command not found
	if (!hasClass(commands[commands.length - 1], 'land') && !hasClass(commands[commands.length - 1], 'home')) {
		alert('Could not generate mission file, because the last command of the timeline must be "land" or "home"!')
		return false
	}

	for (var i = 0; i < commands.length; i++) {
		switch (commands[i].className) {
			case 'draggable assign':
				text = 'drone = assign any'
				break

			case 'draggable arm':
				text = 'arm drone'
				break

			case 'draggable take-off':
				var meters = commands[i].querySelector('#m').value
				text = 'takeoff drone, ' + meters + '.m'
				break

			case 'draggable move':
				var meters = commands[i].querySelector('#m').value
				var position = commands[i].querySelector('#p').value
				var speed = commands[i].querySelector('#s').value
				text = 'move drone, ' + position + ': ' + meters + '.m, speed: ' + speed + '.m/s'
				break

			case 'draggable go-to':
				var coordinates = (commands[i].querySelector('#coords').value).split(' , ', 2)
				var speed = commands[i].querySelector('#s').value
				text = 'move drone, lat: ' + coordinates[0] + ', lon: ' + coordinates[1] + ', alt: drone.position.alt, speed: ' + speed + '.m/s'
				break

			case 'draggable rotate-deg':
				var degrees = commands[i].querySelector('#d').value
				text = 'turn drone, ' + degrees + '.deg'
				break

			case 'draggable rotate-card':
				var direction = commands[i].querySelector('#c').value
				text = 'turn drone, ' + direction
				break

			case 'draggable repeat':
				var times = commands[i].querySelector('#t').value
				text = times + '.times {'
				break

			case 'draggable end':
				text = '}'
				break

			case 'draggable land':
				text = 'land drone'
				break

			case 'draggable home':
				text = 'home drone'
				break

			default:
				text = 'UNKNOWN'
		}
		result += text + '\n\n'
	}

	// Error: something went wrong
	if (result.indexOf('UNKNOWN') > -1) {
		alert('Could not generate mission file, because an unknown command was provided on the timeline!')
		return false
	}

	// Success: generating mission
	var filename = prompt('Mission name:', 'mission')
	if (filename != null) {
		if (filename == '' || filename.charAt(filename.length - 1) == '.') {
			// Default filename
			generateMission(result, 'mission')
			return true
		}
		// Custom filename
		generateMission(result, filename)
		return true
	}
})

document.querySelector('#generator').addEventListener('reset', function (e) {
	e.preventDefault()

	document.querySelector('#timeline').innerHTML = `
		Drag and drop commands here (from the list beside) to create a mission.
		<br>
		It is also possible to discard and re-order the commands.
		<br><br>

		<div class="draggable assign" draggable="true">
			assign
		</div>

		<div class="draggable arm" draggable="true">
			arm
		</div>

		<div class="draggable take-off" draggable="true">
			take off
			<input type="number" name="m" id="m" value="3" min="0" required="">
			meters
		</div>

		<div class="draggable land" draggable="true">
			land
		</div>
	`

	init()
})

// Default coordinates, currently IT - Instituto de Telecomunicações GPS coordinates
const LATITUDE = 40.63493931
const LONGITUDE = -8.65992687

document.addEventListener('click', function (e) {
	if (e.target.name != 'coords' || e.target.parentNode.className != 'draggable go-to') {
		return false
	}

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			// Success, using user coordinates
			openMap(position.coords.latitude, position.coords.longitude)
			return true
		}, function (error) {
			// ##### DEBUG #####
			/*
			switch (error.code) {
				case error.PERMISSION_DENIED:
					alert('User denied the request for Geolocation.')
					break
				case error.POSITION_UNAVAILABLE:
					alert('Location information is unavailable.')
					break
				case error.TIMEOUT:
					alert('The request to get user location timed out.')
					break
				case error.UNKNOWN_ERROR:
					alert('An unknown error occurred.')
					break
			}
			*/

			// Error, using default coordinates
			openMap(LATITUDE, LONGITUDE)
			return false
		})
	} else {
		// ##### DEBUG #####
		//alert('Geolocation is not supported by this browser.')

		// Error, using default coordinates
		openMap(LATITUDE, LONGITUDE)
		return false
	}
})

var marker;

function openMap(latitude, longitude) {

	// Update map center coordinates
	map.setView([latitude, longitude], 15)

	if (marker) {
		map.removeLayer(marker)
	}

	if (latitude != LATITUDE || longitude != LONGITUDE) {
		// Create popup with current position and add it to the layer group
		marker = L.marker([latitude, longitude]).addTo(map).bindPopup('Current position', { autoClose: false, closeOnEscapeKey: false, closeOnClick: false, closeButton: false }).openPopup()
	}


	// ##### DEBUG #####
	/*
	if (latitude == LATITUDE && longitude == LONGITUDE) {
		alert('Opening map with DEFAULT \nLatitude: ' + latitude + '\nLongitude: ' + longitude)
	} else {
		alert('Opening map with CUSTOM \nLatitude: ' + latitude + '\nLongitude: ' + longitude)
	}
	*/


	// Access the popup element
	var popup = document.getElementById('popup')

	// Make the popup visible
	popup.style.visibility = 'visible'

	// Handle click event on map
	map.on('click', function (e) {
		// ##### DEBUG #####
		//console.log(e.latlng.lat, e.latlng.lng)

		// Update go-to coordinates on input
		document.querySelector('.draggable.go-to input[name=coords]').value = e.latlng.lat + ' , ' + e.latlng.lng

		// Make the popup invisible again
		popup.style.visibility = 'hidden'
	}, { once: true })
}