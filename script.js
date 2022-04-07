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
			<input type="number" name="lat" id="lat" value="40.63493931" style="width: 100px;" required>
			latitude and
			<input type="number" name="long" id="long" value="-8.65992687" style="width: 100px;" required>
			longitude
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
				var latitude = commands[i].querySelector('#lat').value
				var longitude = commands[i].querySelector('#long').value
				var speed = commands[i].querySelector('#s').value
				text = 'move drone, lat: ' + latitude + ', lon: ' + longitude + ', alt: drone.position.alt, speed: ' + speed + '.m/s'
				break

			case 'draggable rotate-deg':
				var degrees = commands[i].querySelector('#d').value
				text = 'turn drone, ' + degrees + '.deg'
				break

			case 'draggable rotate-card':
				var cardinal = commands[i].querySelector('#c').value
				text = 'turn drone, ' + cardinal
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
	generateMission(result, "mission")
	return true
})