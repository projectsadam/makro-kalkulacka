const SUPABASE_URL = "https://jshxmdjnknepzzkbyqpx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FjFVlSwMWn3_jnkFfGXmrg_Gh0WUNOt";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


const FOOD_CATALOG = [
  { id: "chicken-breast", name: "Kuřecí prsa", proteinPer100: 23.1, fatPer100: 1.9, carbsPer100: 0 },
  { id: "turkey-breast", name: "Krůtí prsa", proteinPer100: 24, fatPer100: 1.2, carbsPer100: 0 },
  { id: "salmon", name: "Losos", proteinPer100: 20, fatPer100: 13, carbsPer100: 0 },
  { id: "tuna", name: "Tuňák ve vlastní šťávě", proteinPer100: 24, fatPer100: 1, carbsPer100: 0 },
  { id: "egg", name: "Vejce", proteinPer100: 12.6, fatPer100: 10.6, carbsPer100: 1.1 },
  { id: "cottage", name: "Cottage sýr", proteinPer100: 12, fatPer100: 4.3, carbsPer100: 3 },
  { id: "skyr", name: "Skyr bílý", proteinPer100: 11, fatPer100: 0.2, carbsPer100: 4 },
  { id: "greek-yogurt", name: "Řecký jogurt", proteinPer100: 9, fatPer100: 5, carbsPer100: 3.8 },
  { id: "rice-cooked", name: "Rýže vařená", proteinPer100: 2.7, fatPer100: 0.3, carbsPer100: 28 },
  { id: "pasta-cooked", name: "Těstoviny vařené", proteinPer100: 5.8, fatPer100: 0.9, carbsPer100: 30.9 },
  { id: "potatoes", name: "Brambory vařené", proteinPer100: 1.9, fatPer100: 0.1, carbsPer100: 17 },
  { id: "oats", name: "Ovesné vločky", proteinPer100: 13.5, fatPer100: 7, carbsPer100: 58.7 },
  { id: "bread", name: "Celozrnný chléb", proteinPer100: 8.5, fatPer100: 3.3, carbsPer100: 43 },
  { id: "banana", name: "Banán", proteinPer100: 1.1, fatPer100: 0.3, carbsPer100: 22.8 },
  { id: "apple", name: "Jablko", proteinPer100: 0.3, fatPer100: 0.2, carbsPer100: 13.8 },
  { id: "avocado", name: "Avokádo", proteinPer100: 2, fatPer100: 14.7, carbsPer100: 8.5 },
  { id: "almonds", name: "Mandle", proteinPer100: 21.2, fatPer100: 49.9, carbsPer100: 21.6 },
  { id: "olive-oil", name: "Olivový olej", proteinPer100: 0, fatPer100: 100, carbsPer100: 0 },
];

const state = {
  user: null,
  clients: [],
  activeClientId: null,
  activeMealPlanId: null,
};

const elements = {
  clientList: document.querySelector("#clientList"),
  emptyClients: document.querySelector("#emptyClients"),
  clientWorkspace: document.querySelector("#clientWorkspace"),
  clientDialog: document.querySelector("#clientDialog"),
  clientForm: document.querySelector("#clientForm"),
  newClientName: document.querySelector("#newClientName"),
  clientNameInput: document.querySelector("#clientNameInput"),
  mealPlanTabs: document.querySelector("#mealPlanTabs"),
  mealPlanNameInput: document.querySelector("#mealPlanNameInput"),
  foodForm: document.querySelector("#foodForm"),
  foodSelect: document.querySelector("#foodSelect"),
  foodPreview: document.querySelector("#foodPreview"),
  previewProtein: document.querySelector("#previewProtein"),
  previewFat: document.querySelector("#previewFat"),
  previewCarbs: document.querySelector("#previewCarbs"),
  previewCalories: document.querySelector("#previewCalories"),
  foodTableBody: document.querySelector("#foodTableBody"),
  emptyFoods: document.querySelector("#emptyFoods"),
  totalProtein: document.querySelector("#totalProtein"),
  totalFat: document.querySelector("#totalFat"),
  totalCarbs: document.querySelector("#totalCarbs"),
  totalCalories: document.querySelector("#totalCalories"),
  messageOutput: document.querySelector("#messageOutput"),
  toast: document.querySelector("#toast"),
  loginScreen: document.querySelector("#loginScreen"),
loginForm: document.querySelector("#loginForm"),
loginEmail: document.querySelector("#loginEmail"),
loginPassword: document.querySelector("#loginPassword"),
loginButton: document.querySelector("#loginButton"),
loginError: document.querySelector("#loginError"),
application: document.querySelector("#application"),
logoutButton: document.querySelector("#logoutButton"),
};

document.querySelector("#addClientButton").addEventListener("click", openClientDialog);
document.querySelector("#cancelClientButton").addEventListener("click", () => elements.clientDialog.close());
document.querySelector("#deleteClientButton").addEventListener("click", deleteActiveClient);
document.querySelector("#addMealPlanButton").addEventListener("click", addMealPlan);
document.querySelector("#deleteMealPlanButton").addEventListener("click", deleteActiveMealPlan);
document.querySelector("#copyMessageButton").addEventListener("click", copyMessage);
elements.clientForm.addEventListener("submit", addClient);
elements.foodForm.addEventListener("submit", addFood);
elements.foodSelect.addEventListener("change", updateSelectedFood);
document.querySelector("#foodAmount").addEventListener("input", updateFoodPreview);
elements.clientNameInput.addEventListener(
  "change",
  updateClientName
);
elements.mealPlanNameInput.addEventListener(
  "change",
  updateMealPlanName
);
elements.loginForm.addEventListener("submit", login);
elements.logoutButton.addEventListener("click", logout);


function activeClient() {
  return state.clients.find(client => client.id === state.activeClientId) ?? null;
}

function activeMealPlan() {
  const client = activeClient();
  return client?.mealPlans.find(plan => plan.id === state.activeMealPlanId) ?? null;
}

function openClientDialog() {
  elements.newClientName.value = "";
  elements.clientDialog.showModal();
  setTimeout(() => elements.newClientName.focus(), 0);
}


async function deleteActiveClient() {
  const client = activeClient();

  if (
    !client ||
    !confirm(
      `Opravdu chcete smazat klienta „${client.name}“?`
    )
  ) {
    return;
  }

  const { error } = await supabaseClient
    .from("clients")
    .delete()
    .eq("id", client.id)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);
    showToast("Klienta se nepodařilo smazat.");
    return;
  }

  state.clients = state.clients.filter(
    item => item.id !== client.id
  );

  const nextClient = state.clients[0] ?? null;

  state.activeClientId = nextClient?.id ?? null;
  state.activeMealPlanId =
    nextClient?.mealPlans[0]?.id ?? null;

  render();
}

function selectClient(clientId) {
  const client = state.clients.find(
    item => item.id === clientId
  );

  state.activeClientId = clientId;
  state.activeMealPlanId =
    client?.mealPlans[0]?.id ?? null;

  render();
}

function selectMealPlan(planId) {
  state.activeMealPlanId = planId;
  render();
}

async function addMealPlan() {
  const client = activeClient();

  if (!client || !state.user) {
    return;
  }

  const name =
    `Jídelníček ${client.mealPlans.length + 1}`;

  const { data: plan, error } =
    await supabaseClient
      .from("meal_plans")
      .insert({
        user_id: state.user.id,
        client_id: client.id,
        name,
      })
      .select("id, name")
      .single();

  if (error) {
    console.error(error);
    showToast("Jídelníček se nepodařilo přidat.");
    return;
  }

  client.mealPlans.push({
    id: plan.id,
    name: plan.name,
    foods: [],
    customMessage: "",
  });

  state.activeMealPlanId = plan.id;
  render();
}

async function deleteActiveMealPlan() {
  const client = activeClient();
  const plan = activeMealPlan();

  if (!client || !plan) {
    return;
  }

  if (client.mealPlans.length === 1) {
    showToast(
      "Klient musí mít alespoň jeden jídelníček."
    );
    return;
  }

  if (!confirm(`Opravdu chcete smazat „${plan.name}“?`)) {
    return;
  }

  const { error } = await supabaseClient
    .from("meal_plans")
    .delete()
    .eq("id", plan.id)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);
    showToast("Jídelníček se nepodařilo smazat.");
    return;
  }

  client.mealPlans = client.mealPlans.filter(
    item => item.id !== plan.id
  );

  state.activeMealPlanId =
    client.mealPlans[0].id;

  render();
}

async function updateClientName(event) {
  const client = activeClient();
  const name = event.target.value.trim();

  if (!client || !name) {
    if (client) {
      event.target.value = client.name;
    }

    return;
  }

  const oldName = client.name;

  const { error } = await supabaseClient
    .from("clients")
    .update({ name })
    .eq("id", client.id)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);
    event.target.value = oldName;
    showToast("Jméno se nepodařilo uložit.");
    return;
  }

  client.name = name;
  renderClientList();
  renderMessage(false);
}

async function updateMealPlanName(event) {
  const plan = activeMealPlan();
  const name = event.target.value.trim();

  if (!plan || !name) {
    if (plan) {
      event.target.value = plan.name;
    }

    return;
  }

  const oldName = plan.name;

  const { error } = await supabaseClient
    .from("meal_plans")
    .update({ name })
    .eq("id", plan.id)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);
    event.target.value = oldName;
    showToast(
      "Název jídelníčku se nepodařilo uložit."
    );
    return;
  }

  plan.name = name;
  renderMealPlanTabs();
  renderMessage(false);
}

function populateFoodCatalog() {
  const groups = new Map([
    ["Maso a ryby", ["chicken-breast", "turkey-breast", "salmon", "tuna"]],
    ["Mléčné výrobky a vejce", ["egg", "cottage", "skyr", "greek-yogurt"]],
    ["Přílohy a pečivo", ["rice-cooked", "pasta-cooked", "potatoes", "oats", "bread"]],
    ["Ovoce, ořechy a tuky", ["banana", "apple", "avocado", "almonds", "olive-oil"]],
  ]);

  groups.forEach((foodIds, label) => {
    const group = document.createElement("optgroup");
    group.label = label;

    foodIds.forEach(foodId => {
      const food = FOOD_CATALOG.find(item => item.id === foodId);
      if (!food) return;

      const option = document.createElement("option");
      option.value = food.id;
      option.textContent = food.name;
      group.append(option);
    });

    elements.foodSelect.append(group);
  });
}

function selectedCatalogFood() {
  return FOOD_CATALOG.find(food => food.id === elements.foodSelect.value) ?? null;
}

function updateSelectedFood() {
  updateFoodPreview();
}

function updateFoodPreview() {
  const food = selectedCatalogFood();
  const amount = numberValue("#foodAmount");
  const proteinInput = document.querySelector("#foodProtein");
  const fatInput = document.querySelector("#foodFat");
  const carbsInput = document.querySelector("#foodCarbs");

  if (!food || amount <= 0) {
    proteinInput.value = "";
    fatInput.value = "";
    carbsInput.value = "";
    elements.foodPreview.hidden = true;
    return;
  }

  const ratio = amount / 100;
  const protein = food.proteinPer100 * ratio;
  const fat = food.fatPer100 * ratio;
  const carbs = food.carbsPer100 * ratio;
  const calories = protein * 4 + carbs * 4 + fat * 9;

  proteinInput.value = roundForInput(protein);
  fatInput.value = roundForInput(fat);
  carbsInput.value = roundForInput(carbs);

  elements.previewProtein.textContent = `B ${formatNumber(protein)} g`;
  elements.previewFat.textContent = `T ${formatNumber(fat)} g`;
  elements.previewCarbs.textContent = `S ${formatNumber(carbs)} g`;
  elements.previewCalories.textContent = `${formatNumber(calories)} kcal`;
  elements.foodPreview.hidden = false;
}

function roundForInput(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

async function addFood(event) {
  event.preventDefault();

  const plan = activeMealPlan();
  const catalogFood = selectedCatalogFood();
  const amount = numberValue("#foodAmount");

  if (
    !plan ||
    !catalogFood ||
    amount <= 0 ||
    !state.user
  ) {
    return;
  }

  const { data: item, error } =
    await supabaseClient
      .from("meal_plan_items")
      .insert({
        user_id: state.user.id,
        meal_plan_id: plan.id,

        food_id: catalogFood.id,
        food_name: catalogFood.name,

        amount,

        protein_per_100:
          catalogFood.proteinPer100,

        fat_per_100:
          catalogFood.fatPer100,

        carbs_per_100:
          catalogFood.carbsPer100,
      })
      .select(`
        id,
        food_id,
        food_name,
        amount,
        protein_per_100,
        fat_per_100,
        carbs_per_100
      `)
      .single();

  if (error) {
    console.error(error);
    showToast("Položku se nepodařilo uložit.");
    return;
  }

  plan.foods.push({
    id: item.id,
    catalogFoodId: item.food_id,
    name: item.food_name,
    amount: Number(item.amount),

    proteinPer100:
      Number(item.protein_per_100),

    fatPer100:
      Number(item.fat_per_100),

    carbsPer100:
      Number(item.carbs_per_100),
  });

  elements.foodForm.reset();
  document.querySelector("#foodAmount").value = "100";

  updateSelectedFood();
  elements.foodSelect.focus();
  renderPlan();
}

async function deleteFood(foodId) {
  const plan = activeMealPlan();

  if (!plan) {
    return;
  }

  const { error } = await supabaseClient
    .from("meal_plan_items")
    .delete()
    .eq("id", foodId)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);
    showToast("Položku se nepodařilo smazat.");
    return;
  }

  plan.foods = plan.foods.filter(
    food => food.id !== foodId
  );

  renderPlan();
}


function numberValue(selector) {
  return Number.parseFloat(document.querySelector(selector).value) || 0;
}

function calculateFood(food) {
  const ratio = food.amount / 100;
  return {
    protein: food.proteinPer100 * ratio,
    fat: food.fatPer100 * ratio,
    carbs: food.carbsPer100 * ratio,
  };
}

function calculateTotals(plan) {
  const totals = plan.foods.reduce((sum, food) => {
    const calculated = calculateFood(food);
    sum.protein += calculated.protein;
    sum.fat += calculated.fat;
    sum.carbs += calculated.carbs;
    return sum;
  }, { protein: 0, fat: 0, carbs: 0 });

  totals.calories = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
  return totals;
}

function formatNumber(value) {
  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);
}

function generateMessage() {
  const client = activeClient();
  const plan = activeMealPlan();
  if (!client || !plan) return "";

  const totals = calculateTotals(plan);
  const rows = plan.foods.map(food => {
    const macros = calculateFood(food);
    return `• ${food.name}: ${formatNumber(food.amount)} g — B ${formatNumber(macros.protein)} g, T ${formatNumber(macros.fat)} g, S ${formatNumber(macros.carbs)} g`;
  });

  return [
    `Dobrý den${client.name ? `, ${client.name}` : ""},`,
    "",
    `posílám přehled jídelníčku „${plan.name}“:`,
    "",
    ...(rows.length ? rows : ["• Jídelníček zatím neobsahuje žádné položky."]),
    "",
    "Celkem:",
    `Bílkoviny: ${formatNumber(totals.protein)} g`,
    `Tuky: ${formatNumber(totals.fat)} g`,
    `Sacharidy: ${formatNumber(totals.carbs)} g`,
    `Orientační energetická hodnota: ${formatNumber(totals.calories)} kcal`,
    "",
    "S pozdravem",
  ].join("\n");
}

function render() {
  renderClientList();

  const client = activeClient();
  elements.clientWorkspace.hidden = !client;

  if (!client) return;

  if (!activeMealPlan()) {
    state.activeMealPlanId = client.mealPlans[0]?.id ?? null;
  }

  elements.clientNameInput.value = client.name;
  renderMealPlanTabs();
  renderPlan();
}

function renderClientList() {
  elements.clientList.innerHTML = "";
  elements.emptyClients.hidden = state.clients.length > 0;

  state.clients.forEach(client => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `client-item${client.id === state.activeClientId ? " active" : ""}`;
    button.textContent = client.name || "Klient bez názvu";
    button.addEventListener("click", () => selectClient(client.id));
    elements.clientList.append(button);
  });
}

function renderMealPlanTabs() {
  const client = activeClient();
  elements.mealPlanTabs.innerHTML = "";
  if (!client) return;

  client.mealPlans.forEach(plan => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tab${plan.id === state.activeMealPlanId ? " active" : ""}`;
    button.textContent = plan.name || "Jídelníček";
    button.addEventListener("click", () => selectMealPlan(plan.id));
    elements.mealPlanTabs.append(button);
  });
}

function renderPlan() {
  const plan = activeMealPlan();
  if (!plan) return;

  elements.mealPlanNameInput.value = plan.name;
  elements.foodTableBody.innerHTML = "";
  elements.emptyFoods.hidden = plan.foods.length > 0;

  plan.foods.forEach(food => {
    const macros = calculateFood(food);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(food.name)}</td>
      <td>${formatNumber(food.amount)} g</td>
      <td>${formatNumber(macros.protein)} g</td>
      <td>${formatNumber(macros.fat)} g</td>
      <td>${formatNumber(macros.carbs)} g</td>
      <td><button class="delete-row" type="button" aria-label="Smazat ${escapeHtml(food.name)}">Smazat</button></td>
    `;
    row.querySelector("button").addEventListener("click", () => deleteFood(food.id));
    elements.foodTableBody.append(row);
  });

  const totals = calculateTotals(plan);
  elements.totalProtein.textContent = `${formatNumber(totals.protein)} g`;
  elements.totalFat.textContent = `${formatNumber(totals.fat)} g`;
  elements.totalCarbs.textContent = `${formatNumber(totals.carbs)} g`;
  elements.totalCalories.textContent = `${formatNumber(totals.calories)} kcal`;
  renderMessage(true);
}

function renderMessage(force) {
  const plan = activeMealPlan();
  if (!plan) return;
  if (force || !elements.messageOutput.matches(":focus")) {
    elements.messageOutput.value = generateMessage();
  }
}

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(elements.messageOutput.value);
    showToast("Zpráva byla zkopírována.");
  } catch {
    elements.messageOutput.select();
    document.execCommand("copy");
    showToast("Zpráva byla zkopírována.");
  }
}



function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2200);
}

initializeApplication();

async function initializeApplication() {
  populateFoodCatalog();

  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error || !session?.user) {
    showLogin();
    return;
  }

  state.user = session.user;
  await showApplication();
}

async function login(event) {
  event.preventDefault();

  elements.loginError.textContent = "";
  elements.loginButton.disabled = true;

  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

  elements.loginButton.disabled = false;

  if (error) {
    console.error(error);
    elements.loginError.textContent =
      "Nesprávný e-mail nebo heslo.";
    return;
  }

  state.user = data.user;
  elements.loginPassword.value = "";

  await showApplication();
}

async function logout() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showToast("Odhlášení se nepodařilo.");
    return;
  }

  state.user = null;
  state.clients = [];
  state.activeClientId = null;
  state.activeMealPlanId = null;

  render();
  showLogin();
}

function showLogin() {
  elements.application.hidden = true;
  elements.loginScreen.hidden = false;
}

async function showApplication() {
  elements.loginScreen.hidden = true;
  elements.application.hidden = false;

  await loadDataFromDatabase();
}

async function loadDataFromDatabase() {
  if (!state.user) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("clients")
    .select(`
      id,
      name,
      created_at,
      meal_plans (
        id,
        name,
        created_at,
        meal_plan_items (
          id,
          food_id,
          food_name,
          amount,
          protein_per_100,
          fat_per_100,
          carbs_per_100,
          created_at
        )
      )
    `)
    .eq("user_id", state.user.id)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(error);
    showToast("Data se nepodařilo načíst.");
    return;
  }

  state.clients = (data ?? []).map(client => ({
    id: client.id,
    name: client.name,

    mealPlans: (client.meal_plans ?? [])
      .sort(compareCreatedAt)
      .map(plan => ({
        id: plan.id,
        name: plan.name,
        customMessage: "",

        foods: (plan.meal_plan_items ?? [])
          .sort(compareCreatedAt)
          .map(item => ({
            id: item.id,
            catalogFoodId: item.food_id,
            name: item.food_name,
            amount: Number(item.amount),

            proteinPer100:
              Number(item.protein_per_100),

            fatPer100:
              Number(item.fat_per_100),

            carbsPer100:
              Number(item.carbs_per_100),
          })),
      })),
  }));

  state.activeClientId =
    state.clients[0]?.id ?? null;

  state.activeMealPlanId =
    state.clients[0]?.mealPlans[0]?.id ?? null;

  render();
}

function compareCreatedAt(first, second) {
  return (
    new Date(first.created_at) -
    new Date(second.created_at)
  );
}

async function addClient(event) {
  event.preventDefault();

  const name = elements.newClientName.value.trim();

  if (!name || !state.user) {
    return;
  }

  const { data: client, error: clientError } =
    await supabaseClient
      .from("clients")
      .insert({
        user_id: state.user.id,
        name,
      })
      .select("id, name")
      .single();

  if (clientError) {
    console.error(clientError);
    showToast("Klienta se nepodařilo přidat.");
    return;
  }

  const { data: plan, error: planError } =
    await supabaseClient
      .from("meal_plans")
      .insert({
        user_id: state.user.id,
        client_id: client.id,
        name: "Jídelníček 1",
      })
      .select("id, name")
      .single();

  if (planError) {
    console.error(planError);

    await supabaseClient
      .from("clients")
      .delete()
      .eq("id", client.id);

    showToast("Jídelníček se nepodařilo vytvořit.");
    return;
  }

  state.clients.push({
    id: client.id,
    name: client.name,
    mealPlans: [
      {
        id: plan.id,
        name: plan.name,
        foods: [],
        customMessage: "",
      },
    ],
  });

  state.activeClientId = client.id;
  state.activeMealPlanId = plan.id;

  elements.clientDialog.close();
  render();
}