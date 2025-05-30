let formChanged = false
const form = document.querySelector("#updateForm")
const buttonMessage = document.getElementById("buttonMessage")
const originalValues = {}

// Enable button when form is changed
form.addEventListener("change", function () {
  formChanged = true
  validateForm()
})

document.addEventListener("DOMContentLoaded", function() {
  const inputs = form.querySelectorAll("input, select, textarea")
  inputs.forEach(input => {
    originalValues[input.id || input.name] = input.value
  })
  validateForm()
})

form.addEventListener('submit', function(e) {
  if (!validateForm()) {
    e.preventDefault()
    alert('Please fill out all fields correctly.')
    return
  }
})

// Function to validate the form and enable/disable button accordingly
function validateForm() {
  let valid = true
  let hasChanges = false
  const updateBtn = document.querySelector("button")
  
  const requiredFields = [
    'classificationList', 'inv_make', 'inv_model', 'inv_year', 'inv_description', 
    'inv_image', 'inv_thumbnail', 'inv_price', 'inv_miles', 'inv_color'
  ]
  
  requiredFields.forEach(function(id) {
    const el = document.getElementById(id)
    if (!el || !el.value || (el.type === 'number' && isNaN(el.value))) {
      valid = false
      if (el) el.style.borderColor = '#b71c1c'
    } else {
      if (el) el.style.borderColor = ''
      
      if (originalValues[id] !== el.value) {
        hasChanges = true
      }
    }
  })
  
  // Update button state and message
  if (valid && hasChanges) {
    updateBtn.removeAttribute("disabled")
    buttonMessage.textContent = "Form is valid and ready to submit."
    buttonMessage.className = "button-message success"
  } else {
    updateBtn.setAttribute("disabled", "disabled")
    
    if (!hasChanges) {
      buttonMessage.textContent = "Make changes to enable the update button."
      buttonMessage.className = "button-message"
    } else if (!valid) {
      buttonMessage.textContent = "Please fill in all required fields correctly."
      buttonMessage.className = "button-message error"
    }
  }
  
  return valid
}
