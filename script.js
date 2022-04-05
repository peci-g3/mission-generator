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
				<option value="up">up</option>
				<option value="down">down</option>
			</select>
			with speed of
			<input type="number" name="s" id="s" value="5" min="0" required>
			m/s
		</div>

		<!--<div class="draggable go-to" draggable="true">
			go to
			<input type="number" name="lat" id="lat" value="40.63493931003116" required>
			latitude
			<input type="number" name="long" id="long" value="-8.659926876929458" required>
			and longitude
			with speed of
			<input type="number" name="s" id="s" value="5" min="0" required>
			m/s
		</div>-->

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

document.querySelector('#generate').addEventListener('submit', function (e) {
	e.preventDefault()

	var result = ''
	var div = document.getElementById('timeline')
	var divChildren = div.childNodes

	// Error: empty timeline
	if (divChildren.length < 5) {
		alert('Could not generate mission file, because timeline is empty!')
		return false
	}

	// Error: not enough commands
	if (divChildren.length < 7) {
		alert('Could not generate mission file, because timeline does not have enough commands! \nMust have one "assign", one "arm" and one "take off" command obligatorily.')
		return false
	}

	// Error: "assign" command not found
	if (!hasClass(divChildren[4], 'assign')) {
		alert('Could not generate mission file, because the first command of the timeline must be "assign"!')
		return false
	}

	// Error: "arm" command not found
	if (!hasClass(divChildren[5], 'arm')) {
		alert('Could not generate mission file, because the second command of the timeline must be "arm"!')
		return false
	}

	// Error: "take off" command not found
	if (!hasClass(divChildren[6], 'take-off')) {
		alert('Could not generate mission file, because the third command of the timeline must be "take off"!')
		return false
	}

	// Error: "land" or "home" command not found
	if (!hasClass(divChildren[divChildren.length - 1], 'land') && !hasClass(divChildren[divChildren.length - 1], 'home')) {
		alert('Could not generate mission file, because the last command of the timeline must be "land" or "home"!')
		return false
	}

	for (var i = 4; i < divChildren.length; i++) {

		// TODO: Debug
		console.log(divChildren[i])

		switch (divChildren[i].className) {
			case 'draggable assign':
				text = 'drone = assign any'
				break

			case 'draggable arm':
				text = 'arm drone'
				break

			case 'draggable take-off':
				var meters = divChildren[i].querySelector('#m').value
				text = 'takeoff drone, ' + meters + '.m'
				break

			case 'draggable move':
				var meters = divChildren[i].querySelector('#m').value
				var position = divChildren[i].querySelector('#p').value
				var speed = divChildren[i].querySelector('#s').value
				text = 'move drone, ' + position + ': ' + meters + '.m, speed: ' + speed + '.m/s'
				break

			case 'draggable go-to':
				var latitude = divChildren[i].querySelector('#lat').value
				var longitude = divChildren[i].querySelector('#long').value
				var speed = divChildren[i].querySelector('#s').value
				text = 'move drone, lat: ' + latitude + ', lon: ' + longitude + ', alt: drone.position.alt, speed: ' + speed + '.m/s'
				break

			case 'draggable rotate-deg':
				var degrees = divChildren[i].querySelector('#d').value
				text = 'turn drone, ' + degrees + '.deg'
				break

			case 'draggable rotate-card':
				var cardinal = divChildren[i].querySelector('#c').value
				text = 'turn drone, ' + cardinal
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

	// TODO: Debug
	console.log('\n\nFINAL OUTPUT:\n' + result)

	// Error: something went wrong
	if (result.indexOf('UNKNOWN') > -1) {
		alert('Could not generate mission file, because an unknown command was provided on the timeline!')
		return false
	}

	// Success: generating mission
	generateMission(result, "mission")
	return true
})