// Declaring variables
const answers = {
  question1: "no",
  question2: "no",
  question3: "no",
  question4: "no",
  question5: "no",
};
const checkboxes = {
  checkbox1: false,
  checkbox2: false,
  checkbox3: false,
};

// Displays a hyphen at the appropriate points for the users contact number
document
  .getElementById("mce-PHONE")
  .addEventListener("input", function (event) {
    // Remove any non-numeric characters
    let input = event.target.value.replace(/\D/g, "");
    let formattedInput = "";

    if (input.length > 0) {
      formattedInput = input.substring(0, 2);
    }
    if (input.length >= 3) {
      formattedInput += "-" + input.substring(2, 5);
    }
    if (input.length >= 6) {
      formattedInput += "-" + input.substring(5, 9);
    }

    event.target.value = formattedInput;
  });

// Function to handle radio button change
const handleChange = (question, value) => {
  answers[question] = value;
  checkConditions();
};

// Function to handle checkbox change
const handleCheckboxChange = () => {
  checkboxes.checkbox1 = document.getElementById("checkbox1").checked;
  checkboxes.checkbox2 = document.getElementById("checkbox2").checked;
  checkboxes.checkbox3 = document.getElementById("checkbox3").checked;
  checkConditions();
};

// Function to check if all conditions are met
const checkConditions = () => {
  const allRadioYes = Object.values(answers).every(
    (answer) => answer === "yes"
  );
  const allCheckboxChecked = Object.values(checkboxes).every(
    (checked) => checked === true
  );

  // Display the button only if all radio buttons are "yes" and all checkboxes are checked
  const submitButton = document.getElementById("submitButton");
  if (!allRadioYes || !allCheckboxChecked) {
    submitButton.style.display = "none";
  } else {
    submitButton.style.display = "block";
  }
};

// Function that edits the form data and adds the IP address and Location
const addData = async (formData) => {
  // Adds South african dialing code and extra details of the user
  formData.set("PHONE", `+27 ${formData.get("PHONE")}`);
  formData.set("CONSENT", `Consented`);

  // Fetches the users IP address
  const ip = await fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      formData.set("IPADDRESS", `${data.ip}`);
      return data.ip;
    })
    .catch((error) => console.error("Fetching IP:", error));

  // Fetches the users location using their IP address
  await fetch(`https://ip-api.com/json/${ip}?fields=country`)
    .then((response) => response.json())
    .then((data) => {
      formData.set("LOCATION", `${data.country}`);
    })
    .catch((error) => console.error("Error:", error));

  return formData;
};

// Submits form data when submit button is selected
document
  .getElementById("contactForm")
  .addEventListener("submit", async function (event) {
    // Prevents default functions after form is submitted
    event.preventDefault();

    // Get form data
    let formData = new FormData(this);
    let allFieldsFilled = true;

    // Skips the input tag with the appropriate name
    for (const [key, value] of formData.entries()) {
      if (key === "b_cd3e3380477cf476388436d0f_6ac762a776") {
        continue;
      }

      // Checks if all fields have a value which are not white spaces
      if (!value.trim()) {
        allFieldsFilled = false;
        break;
      }
    }

    // If all fields are full post data and display a message
    if (allFieldsFilled) {
      // Calls a function to add more data
      formData = await addData(formData);

      // Sends form data
      fetch(this.action, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      }).then(() => {
        // Clear the form after submission
        document.getElementById("contactForm").reset();

        // Resets the answers and checkboxes
        Object.keys(answers).forEach((key) => {
          answers[key] = "no";
        });
        Object.keys(checkboxes).forEach((key) => {
          checkboxes[key] = false;
        });

        // Ensures submit button is hidden
        const submitButton = document.getElementById("submitButton");
        submitButton.style.display = "none";

        // Show the sliding message
        const slideMessage = document.getElementById("slideMessage");
        slideMessage.classList.add("active");
        // Remove the message after 3 seconds (slide it back up)
        setTimeout(() => {
          slideMessage.classList.remove("active");
        }, 3000);
      });
    }
  });
