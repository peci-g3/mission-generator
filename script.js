const containers = document.querySelectorAll('.container')

function init() {
	document.querySelector("#commands").innerHTML = `
    <div class="draggable take-off" draggable="true">
      take off
    </div>

    <div class="draggable move" draggable="true">
      move
      <input type="number" name="m" id="m" value="5" min="0" required>
      meters
      <select name="p" id="p" required>
        <option value="forward">forward</option>
        <option value="backwards">backwards</option>
        <option value="left">left</option>
        <option value="right">right</option>
        <option value="up">up</option>
        <option value="down">down</option>
      </select>
    </div>

    <div class="draggable rotate" draggable="true">
      rotate
      <input type="number" name="d" id="d" value="45" min="0" required>
      degrees
      <select name="r" id="r" required>
        <option value="clockwise">clockwise</option>
        <option value="counterclockwise">counterclockwise</option>
      </select>
    </div>

    <div class="draggable land" draggable="true">land</div>
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