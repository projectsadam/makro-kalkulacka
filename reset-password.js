const SUPABASE_URL =
  "https://jshxmdjnknepzzkbyqpx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_FjFVlSwMWn3_jnkFfGXmrg_Gh0WUNOt";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

const form =
  document.querySelector("#resetPasswordForm");

const newPasswordInput =
  document.querySelector("#newPassword");

const confirmPasswordInput =
  document.querySelector("#confirmPassword");

const saveButton =
  document.querySelector("#savePasswordButton");

const message =
  document.querySelector("#resetPasswordMessage");

let recoverySessionReady = false;

supabaseClient.auth.onAuthStateChange(
  (event, session) => {
    if (
      event === "PASSWORD_RECOVERY"
      && session
    ) {
      recoverySessionReady = true;
      message.textContent =
        "Odkaz byl ověřen. Zadejte nové heslo.";
    }
  }
);

form.addEventListener(
  "submit",
  updatePassword
);

async function updatePassword(event) {
  event.preventDefault();

  message.textContent = "";

  const password =
    newPasswordInput.value;

  const confirmation =
    confirmPasswordInput.value;

  if (password.length < 8) {
    message.textContent =
      "Heslo musí mít alespoň 8 znaků.";
    return;
  }

  if (password !== confirmation) {
    message.textContent =
      "Hesla se neshodují.";
    return;
  }

  if (!recoverySessionReady) {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      message.textContent =
        "Odkaz pro změnu hesla je neplatný nebo vypršel.";
      return;
    }
  }

  saveButton.disabled = true;

  const { error } =
    await supabaseClient.auth.updateUser({
      password,
    });

  saveButton.disabled = false;

  if (error) {
    console.error(error);

    message.textContent =
      `Heslo se nepodařilo změnit: ${error.message}`;

    return;
  }

  message.textContent =
    "Heslo bylo úspěšně změněno.";

  await supabaseClient.auth.signOut();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1200);
}