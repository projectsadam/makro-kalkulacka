const STORAGE_KEY = "makro-kalkulacka-v1";

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

const state = loadState();

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
  importInput: document.querySelector("#importInput"),
  toast: document.querySelector("#toast"),
};

document.querySelector("#addClientButton").addEventListener("click", openClientDialog);
document.querySelector("#cancelClientButton").addEventListener("click", () => elements.clientDialog.close());
document.querySelector("#deleteClientButton").addEventListener("click", deleteActiveClient);
document.querySelector("#addMealPlanButton").addEventListener("click", addMealPlan);
document.querySelector("#deleteMealPlanButton").addEventListener("click", deleteActiveMealPlan);
document.querySelector("#copyMessageButton").addEventListener("click", copyMessage);
document.querySelector("#exportButton").addEventListener("click", exportData);
elements.importInput.addEventListener("change", importData);
elements.clientForm.addEventListener("submit", addClient);
elements.foodForm.addEventListener("submit", addFood);
elements.foodSelect.addEventListener("change", updateSelectedFood);
document.querySelector("#foodAmount").addEventListener("input", updateFoodPreview);
elements.clientNameInput.addEventListener("input", updateClientName);
elements.mealPlanNameInput.addEventListener("input", updateMealPlanName);

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function defaultState() {
  return {
    clients: [],
    activeClientId: null,
    activeMealPlanId: null,
  };
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored && Array.isArray(stored.clients) ? stored : defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

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

function addClient(event) {
  event.preventDefault();
  const name = elements.newClientName.value.trim();
  if (!name) return;

  const planId = createId();
  const client = {
    id: createId(),
    name,
    mealPlans: [{
      id: planId,
      name: "Jídelníček 1",
      foods: [],
      customMessage: "",
    }],
  };

  state.clients.push(client);
  state.activeClientId = client.id;
  state.activeMealPlanId = planId;
  saveState();
  elements.clientDialog.close();
  render();
}

function deleteActiveClient() {
  const client = activeClient();
  if (!client || !confirm(`Opravdu chcete smazat klienta „${client.name}“?`)) return;

  state.clients = state.clients.filter(item => item.id !== client.id);
  const nextClient = state.clients[0] ?? null;
  state.activeClientId = nextClient?.id ?? null;
  state.activeMealPlanId = nextClient?.mealPlans[0]?.id ?? null;
  saveState();
  render();
}

function selectClient(clientId) {
  const client = state.clients.find(item => item.id === clientId);
  state.activeClientId = clientId;
  state.activeMealPlanId = client?.mealPlans[0]?.id ?? null;
  saveState();
  render();
}

function addMealPlan() {
  const client = activeClient();
  if (!client) return;

  const plan = {
    id: createId(),
    name: `Jídelníček ${client.mealPlans.length + 1}`,
    foods: [],
    customMessage: "",
  };
  client.mealPlans.push(plan);
  state.activeMealPlanId = plan.id;
  saveState();
  render();
}

function deleteActiveMealPlan() {
  const client = activeClient();
  const plan = activeMealPlan();
  if (!client || !plan) return;

  if (client.mealPlans.length === 1) {
    showToast("Klient musí mít alespoň jeden jídelníček.");
    return;
  }
  if (!confirm(`Opravdu chcete smazat „${plan.name}“?`)) return;

  client.mealPlans = client.mealPlans.filter(item => item.id !== plan.id);
  state.activeMealPlanId = client.mealPlans[0].id;
  saveState();
  render();
}

function selectMealPlan(planId) {
  state.activeMealPlanId = planId;
  saveState();
  render();
}

function updateClientName(event) {
  const client = activeClient();
  if (!client) return;
  client.name = event.target.value;
  saveState();
  renderClientList();
  renderMessage(false);
}

function updateMealPlanName(event) {
  const plan = activeMealPlan();
  if (!plan) return;
  plan.name = event.target.value;
  saveState();
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

function addFood(event) {
  event.preventDefault();
  const plan = activeMealPlan();
  const catalogFood = selectedCatalogFood();
  if (!plan || !catalogFood) return;

  const food = {
    id: createId(),
    catalogFoodId: catalogFood.id,
    name: catalogFood.name,
    amount: numberValue("#foodAmount"),
    proteinPer100: catalogFood.proteinPer100,
    fatPer100: catalogFood.fatPer100,
    carbsPer100: catalogFood.carbsPer100,
  };

  if (food.amount <= 0) return;
  plan.foods.push(food);
  saveState();

  elements.foodForm.reset();
  document.querySelector("#foodAmount").value = "100";
  updateSelectedFood();
  elements.foodSelect.focus();
  renderPlan();
}

function deleteFood(foodId) {
  const plan = activeMealPlan();
  if (!plan) return;
  plan.foods = plan.foods.filter(food => food.id !== foodId);
  saveState();
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

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `makro-kalkulacka-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported || !Array.isArray(imported.clients)) throw new Error();

      state.clients = imported.clients;
      state.activeClientId = imported.activeClientId ?? imported.clients[0]?.id ?? null;
      const client = activeClient();
      state.activeMealPlanId = imported.activeMealPlanId ?? client?.mealPlans[0]?.id ?? null;
      saveState();
      render();
      showToast("Data byla úspěšně importována.");
    } catch {
      showToast("Soubor nemá správný formát.");
    } finally {
      elements.importInput.value = "";
    }
  };
  reader.readAsText(file);
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

populateFoodCatalog();
render();
