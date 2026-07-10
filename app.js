const SUPABASE_URL = "https://jshxmdjnknepzzkbyqpx.supabase.co";

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
  },
);

const MEAL_PLAN_TYPES = ["Snídaně", "Oběd", "Svačina", "Večeře"];

const state = {
  user: null,
  clients: [],
  foods: [],
  activeClientId: null,
  activeMealPlanId: null,
};

const elements = {
  application: document.querySelector("#application"),

  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  loginButton: document.querySelector("#loginButton"),
  loginError: document.querySelector("#loginError"),
  logoutButton: document.querySelector("#logoutButton"),

  addClientButton: document.querySelector("#addClientButton"),

  deleteClientButton: document.querySelector("#deleteClientButton"),

  cancelClientButton: document.querySelector("#cancelClientButton"),

  clientList: document.querySelector("#clientList"),
  emptyClients: document.querySelector("#emptyClients"),
  clientWorkspace: document.querySelector("#clientWorkspace"),

  clientNameInput: document.querySelector("#clientNameInput"),

  clientDialog: document.querySelector("#clientDialog"),

  clientForm: document.querySelector("#clientForm"),

  newClientName: document.querySelector("#newClientName"),

  mealPlanTabs: document.querySelector("#mealPlanTabs"),

  mealPlanNameInput: document.querySelector("#mealPlanNameInput"),

  addMealPlanButton: document.querySelector("#addMealPlanButton"),

  deleteMealPlanButton: document.querySelector("#deleteMealPlanButton"),

  foodForm: document.querySelector("#foodForm"),
  foodSelect: document.querySelector("#foodSelect"),
  foodAmount: document.querySelector("#foodAmount"),
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

  copyMessageButton: document.querySelector("#copyMessageButton"),

  toast: document.querySelector("#toast"),

  foodSelectButton: document.querySelector("#foodSelectButton"),

  foodSelectLabel: document.querySelector("#foodSelectLabel"),

  foodDropdown: document.querySelector("#foodDropdown"),

  foodSearchInput: document.querySelector("#foodSearchInput"),

  foodOptions: document.querySelector("#foodOptions"),

  forgotPasswordButton: document.querySelector("#forgotPasswordButton"),

  restDayButton: document.querySelector("#restDayButton"),

  trainingDayButton: document.querySelector("#trainingDayButton"),

  targetsForm: document.querySelector("#targetsForm"),

  targetProtein: document.querySelector("#targetProtein"),

  targetFat: document.querySelector("#targetFat"),

  targetCarbs: document.querySelector("#targetCarbs"),

  targetCalories: document.querySelector("#targetCalories"),

  proteinProgress: document.querySelector("#proteinProgress"),

  fatProgress: document.querySelector("#fatProgress"),

  carbsProgress: document.querySelector("#carbsProgress"),

  caloriesProgress: document.querySelector("#caloriesProgress"),

  proteinTargetText: document.querySelector("#proteinTargetText"),

  fatTargetText: document.querySelector("#fatTargetText"),

  carbsTargetText: document.querySelector("#carbsTargetText"),

  caloriesTargetText: document.querySelector("#caloriesTargetText"),

  addMessageItemButton: document.querySelector("#addMessageItemButton"),

  messageBuilderList: document.querySelector("#messageBuilderList"),

  emptyMessageBuilder: document.querySelector("#emptyMessageBuilder"),

  messageFoodPicker: document.querySelector("#messageFoodPicker"),

  messageFoodPickerList: document.querySelector("#messageFoodPickerList"),

  closeMessageFoodPickerButton: document.querySelector(
    "#closeMessageFoodPickerButton",
  ),

  mealPlanTypeInput: document.querySelector("#mealPlanTypeInput"),
};

registerEventListeners();
initializeApplication();

function registerEventListeners() {
  elements.addClientButton.addEventListener("click", openClientDialog);

  elements.cancelClientButton.addEventListener("click", () =>
    elements.clientDialog.close(),
  );

  elements.deleteClientButton.addEventListener("click", deleteActiveClient);

  elements.addMealPlanButton.addEventListener("click", addMealPlan);

  elements.deleteMealPlanButton.addEventListener("click", deleteActiveMealPlan);

  elements.copyMessageButton.addEventListener("click", copyMessage);

  elements.loginForm.addEventListener("submit", login);

  elements.logoutButton.addEventListener("click", logout);

  elements.clientForm.addEventListener("submit", addClient);

  elements.clientNameInput.addEventListener("change", updateClientName);

  elements.mealPlanNameInput.addEventListener("change", updateMealPlanName);

  elements.foodForm.addEventListener("submit", addFood);

  elements.foodAmount.addEventListener("input", updateFoodPreview);

  elements.foodSelectButton.addEventListener("click", toggleFoodDropdown);

  elements.foodSearchInput.addEventListener("input", renderFoodOptions);

  elements.mealPlanTypeInput.addEventListener("change", updateMealPlanType);

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".food-combobox")) {
      closeFoodDropdown();
    }
  });

  elements.forgotPasswordButton.addEventListener("click", sendPasswordReset);

  elements.restDayButton.addEventListener("click", () =>
    updateSelectedDayType("rest"),
  );

  elements.trainingDayButton.addEventListener("click", () =>
    updateSelectedDayType("training"),
  );

  elements.targetsForm.addEventListener("input", updateActiveTargets);

  elements.mealPlanTabs.addEventListener("click", (event) => {
    const button = event.target.closest(".tab");

    if (!button) {
      return;
    }

    selectMealPlan(button.dataset.planId);
  });

  elements.addMessageItemButton.addEventListener(
    "click",
    toggleMessageFoodPicker,
  );

  elements.closeMessageFoodPickerButton.addEventListener(
    "click",
    closeMessageFoodPicker,
  );
}

/* =========================
   AUTHENTICATION
   ========================= */

async function initializeApplication() {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
    showLogin();
    return;
  }

  if (!session?.user) {
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

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  elements.loginButton.disabled = false;

  if (error) {
    console.error(error);

    elements.loginError.textContent = "Nesprávný e-mail nebo heslo.";

    return;
  }

  state.user = data.user;
  elements.loginPassword.value = "";

  await showApplication();
}

async function logout() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
    showToast("Odhlášení se nepodařilo.");
    return;
  }

  state.user = null;
  state.clients = [];
  state.foods = [];
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

  await Promise.all([loadFoodsFromDatabase(), loadDataFromDatabase()]);
}

/* =========================
   ACTIVE ENTITIES
   ========================= */

function activeClient() {
  return (
    state.clients.find((client) => client.id === state.activeClientId) ?? null
  );
}

function activeMealPlan() {
  const client = activeClient();

  return (
    client?.mealPlans.find((plan) => plan.id === state.activeMealPlanId) ?? null
  );
}

/* =========================
   CLIENTS
   ========================= */

function openClientDialog() {
  elements.newClientName.value = "";
  elements.clientDialog.showModal();

  setTimeout(() => elements.newClientName.focus(), 0);
}

async function addClient(event) {
  event.preventDefault();

  if (!state.user) {
    return;
  }

  const name = elements.newClientName.value.trim();

  if (!name) {
    return;
  }

  const { data: client, error: clientError } = await supabaseClient
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

  const { data: plan, error: planError } = await supabaseClient
    .from("meal_plans")
    .insert({
      user_id: state.user.id,
      client_id: client.id,
      name: "Jídlo 1",
      meal_type: "Snídaně",
    })
    .select("id, name, meal_type")
    .single();

  if (planError) {
    console.error(planError);

    await supabaseClient
      .from("clients")
      .delete()
      .eq("id", client.id)
      .eq("user_id", state.user.id);

    showToast("Výchozí jídelníček se nepodařilo vytvořit.");

    return;
  }

  state.clients.push({
    id: client.id,
    name: client.name,
    selectedDayType: "rest",
    messageItems: [],

    restTargets: {
      protein: 0,
      fat: 0,
      carbs: 0,
      calories: 0,
    },

    trainingTargets: {
      protein: 0,
      fat: 0,
      carbs: 0,
      calories: 0,
    },

    mealPlans: [
      {
        id: plan.id,
        name: plan.name,
        mealType: plan.meal_type || "Snídaně",
        foods: [],
      },
    ],
  });

  state.activeClientId = client.id;
  state.activeMealPlanId = plan.id;

  elements.clientDialog.close();

  render();
  showToast("Klient byl přidán.");
}

async function updateClientName(event) {
  const client = activeClient();
  const name = event.target.value.trim();

  if (!client) {
    return;
  }

  if (!name) {
    event.target.value = client.name;
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

    showToast("Jméno klienta se nepodařilo uložit.");

    return;
  }

  client.name = name;

  renderClientList();
  renderMessage(false);
}

async function deleteActiveClient() {
  const client = activeClient();

  if (!client) {
    return;
  }

  const confirmed = confirm(`Opravdu chcete smazat klienta „${client.name}“?`);

  if (!confirmed) {
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

  state.clients = state.clients.filter((item) => item.id !== client.id);

  const nextClient = state.clients[0] ?? null;

  state.activeClientId = nextClient?.id ?? null;

  state.activeMealPlanId = nextClient?.mealPlans[0]?.id ?? null;

  render();
  showToast("Klient byl smazán.");
}

function selectClient(clientId) {
  const client = state.clients.find((item) => item.id === clientId);

  if (!client) {
    return;
  }

  state.activeClientId = client.id;

  state.activeMealPlanId = client.mealPlans[0]?.id ?? null;

  render();
}

/* =========================
   MEAL PLANS
   ========================= */

function suggestNextMealPlanName(client) {
  return `Jídlo ${client.mealPlans.length + 1}`;
}

async function addMealPlan() {
  const client = activeClient();

  if (!client || !state.user) {
    return;
  }

  const suggestedName = suggestNextMealPlanName(client);

  const nameFromPrompt = prompt("Zadejte název jídla:", suggestedName);

  if (nameFromPrompt === null) {
    return;
  }

  const name = nameFromPrompt.trim();

  if (!name) {
    showToast("Název jídla nesmí být prázdný.");
    return;
  }

  const mealType = elements.mealPlanTypeInput.value || "Oběd";

  const { data: plan, error } = await supabaseClient
    .from("meal_plans")
    .insert({
      user_id: state.user.id,
      client_id: client.id,
      name,
      meal_type: mealType,
    })
    .select("id, name, meal_type")
    .single();

  if (error) {
    console.error("Chyba při přidání jídla:", error);

    showToast(error.message || "Jídlo se nepodařilo přidat.");

    return;
  }

  client.mealPlans.push({
    id: plan.id,
    name: plan.name,
    mealType: plan.meal_type || mealType,
    foods: [],
  });

  state.activeMealPlanId = plan.id;

  render();

  showToast("Jídlo bylo přidáno.");
}

async function deleteActiveMealPlan() {
  const client = activeClient();
  const plan = activeMealPlan();

  if (!client || !plan) {
    return;
  }

  if (client.mealPlans.length === 1) {
    showToast("Klient musí mít alespoň jeden jídelníček.");

    return;
  }

  const confirmed = confirm(`Opravdu chcete smazat jídelníček „${plan.name}“?`);

  if (!confirmed) {
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

  client.mealPlans = client.mealPlans.filter((item) => item.id !== plan.id);

  state.activeMealPlanId = client.mealPlans[0]?.id ?? null;

  render();
  showToast("Jídelníček byl smazán.");
}

function selectMealPlan(planId) {
  state.activeMealPlanId = planId;
  render();
}

/* =========================
   FOOD CATALOG
   ========================= */

async function loadFoodsFromDatabase() {
  if (!state.user) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("foods")
    .select(
      `
        id,
        name,
        category,
        protein_per_100,
        fat_per_100,
        carbs_per_100
      `,
    )
    .eq("user_id", state.user.id)
    .order("category", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(error);

    showToast("Katalog potravin se nepodařilo načíst.");

    return;
  }

  state.foods = (data ?? []).map(mapCatalogFood);

  populateFoodCatalog();
}

function populateFoodCatalog() {
  const selectedFoodStillExists = state.foods.some(
    (food) => food.id === elements.foodSelect.value,
  );

  if (!selectedFoodStillExists) {
    elements.foodSelect.value = "";
    elements.foodSelectLabel.textContent = state.foods.length
      ? "Vyberte potravinu"
      : "Nejprve přidejte potravinu";
  }

  renderFoodOptions();
  updateFoodPreview();
}

function mapCatalogFood(food) {
  return {
    id: food.id,
    name: food.name,
    category: food.category || "Ostatní",

    proteinPer100: Number(food.protein_per_100),

    fatPer100: Number(food.fat_per_100),

    carbsPer100: Number(food.carbs_per_100),
  };
}

/* =========================
   MEAL PLAN ITEMS
   ========================= */

function selectedCatalogFood() {
  return (
    state.foods.find((food) => food.id === elements.foodSelect.value) ?? null
  );
}

function updateFoodPreview() {
  const food = selectedCatalogFood();

  const amount = numberValue(elements.foodAmount);

  if (!food || amount <= 0) {
    elements.foodPreview.hidden = true;
    return;
  }

  const ratio = amount / 100;

  const protein = food.proteinPer100 * ratio;

  const fat = food.fatPer100 * ratio;

  const carbs = food.carbsPer100 * ratio;

  const calories = calculateCalories(protein, fat, carbs);

  elements.previewProtein.textContent = `B ${formatNumber(protein)} g`;

  elements.previewFat.textContent = `T ${formatNumber(fat)} g`;

  elements.previewCarbs.textContent = `S ${formatNumber(carbs)} g`;

  elements.previewCalories.textContent = `${formatNumber(calories)} kcal`;

  elements.foodPreview.hidden = false;
}

async function addFood(event) {
  event.preventDefault();

  const plan = activeMealPlan();

  const catalogFood = selectedCatalogFood();

  const amount = numberValue(elements.foodAmount);

  if (!state.user || !plan || !catalogFood || amount <= 0) {
    return;
  }

  const { data: item, error } = await supabaseClient
    .from("meal_plan_items")
    .insert({
      user_id: state.user.id,
      meal_plan_id: plan.id,
      food_id: catalogFood.id,
      food_name: catalogFood.name,
      amount,

      protein_per_100: catalogFood.proteinPer100,

      fat_per_100: catalogFood.fatPer100,

      carbs_per_100: catalogFood.carbsPer100,
    })
    .select(
      `
        id,
        food_id,
        food_name,
        amount,
        protein_per_100,
        fat_per_100,
        carbs_per_100
      `,
    )
    .single();

  if (error) {
    console.error(error);

    showToast("Položku se nepodařilo uložit.");

    return;
  }

  plan.foods.push(mapMealPlanItem(item));

  elements.foodForm.reset();

  elements.foodSelect.value = "";
  elements.foodSelectLabel.textContent = state.foods.length
    ? "Vyberte potravinu"
    : "Nejprve přidejte potravinu";

  elements.foodAmount.value = "100";
  elements.foodPreview.hidden = true;

  closeFoodDropdown();
  renderPlan();

  elements.foodSelectButton.focus();

  showToast("Položka byla přidána.");
}

async function deleteFood(foodId) {
  const plan = activeMealPlan();

  if (!plan || !state.user) {
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

  plan.foods = plan.foods.filter((food) => food.id !== foodId);

  renderPlan();

  showToast("Položka byla smazána.");
}

function mapMealPlanItem(item) {
  return {
    id: item.id,
    catalogFoodId: item.food_id,
    name: item.food_name,
    amount: Number(item.amount),

    proteinPer100: Number(item.protein_per_100),

    fatPer100: Number(item.fat_per_100),

    carbsPer100: Number(item.carbs_per_100),
  };
}

/* =========================
   DATABASE LOADING
   ========================= */

async function loadDataFromDatabase() {
  if (!state.user) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("clients")
    .select(
      `
        id,
        name,
        selected_day_type,
        rest_target_protein,
        rest_target_fat,
        rest_target_carbs,
        rest_target_calories,
        training_target_protein,
        training_target_fat,
        training_target_carbs,
        training_target_calories,
        created_at,
        meal_plans (
          id,
          name,
          meal_type,
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
      `,
    )
    .eq("user_id", state.user.id)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(error);

    showToast("Data se nepodařilo načíst.");

    return;
  }

  state.clients = (data ?? []).map((client) => ({
    id: client.id,
    name: client.name,
    selectedDayType: client.selected_day_type || "rest",

    restTargets: {
      protein: Number(client.rest_target_protein),
      fat: Number(client.rest_target_fat),
      carbs: Number(client.rest_target_carbs),
      calories: Number(client.rest_target_calories),
    },

    trainingTargets: {
      protein: Number(client.training_target_protein),
      fat: Number(client.training_target_fat),
      carbs: Number(client.training_target_carbs),
      calories: Number(client.training_target_calories),
    },

    mealPlans: (client.meal_plans ?? []).sort(compareCreatedAt).map((plan) => ({
      id: plan.id,
      name: plan.name,
      mealType: plan.meal_type || "Oběd",
      foods: (plan.meal_plan_items ?? [])
        .sort(compareCreatedAt)
        .map(mapMealPlanItem),
    })),
  }));

  state.clients.forEach((client) => {
    client.messageItems = loadMessageItems(client.id);
  });

  state.activeClientId = state.clients[0]?.id ?? null;

  state.activeMealPlanId = state.clients[0]?.mealPlans[0]?.id ?? null;

  render();
}

/* =========================
   CALCULATIONS
   ========================= */

function calculateFood(food) {
  const ratio = food.amount / 100;

  return {
    protein: food.proteinPer100 * ratio,

    fat: food.fatPer100 * ratio,

    carbs: food.carbsPer100 * ratio,
  };
}

function calculateTotals(plan) {
  const totals = plan.foods.reduce(
    (sum, food) => {
      const calculated = calculateFood(food);

      sum.protein += calculated.protein;
      sum.fat += calculated.fat;
      sum.carbs += calculated.carbs;

      return sum;
    },
    {
      protein: 0,
      fat: 0,
      carbs: 0,
    },
  );

  totals.calories = calculateCalories(totals.protein, totals.fat, totals.carbs);

  return totals;
}

function calculateClientTotals(client) {
  return client.mealPlans.reduce(
    (sum, plan) => {
      const totals = calculateTotals(plan);

      sum.protein += totals.protein;
      sum.fat += totals.fat;
      sum.carbs += totals.carbs;
      sum.calories += totals.calories;

      return sum;
    },
    {
      protein: 0,
      fat: 0,
      carbs: 0,
      calories: 0,
    },
  );
}

function calculateCalories(protein, fat, carbs) {
  return protein * 4 + carbs * 4 + fat * 9;
}

/* =========================
   RENDERING
   ========================= */

function render() {
  renderClientList();

  const client = activeClient();

  elements.clientWorkspace.hidden = !client;

  if (!client) {
    clearWorkspace();
    return;
  }

  if (!activeMealPlan()) {
    state.activeMealPlanId = client.mealPlans[0]?.id ?? null;
  }

  elements.clientNameInput.value = client.name;

  renderTargets();
  renderMealPlanTabs();
  renderPlan();
}

function clearWorkspace() {
  elements.foodTableBody.innerHTML = "";

  elements.totalProtein.textContent = "0 g";
  elements.totalFat.textContent = "0 g";
  elements.totalCarbs.textContent = "0 g";
  elements.totalCalories.textContent = "0 kcal";

  elements.messageOutput.value = "";
}

function renderClientList() {
  elements.clientList.innerHTML = "";

  elements.emptyClients.hidden = state.clients.length > 0;

  state.clients.forEach((client) => {
    const button = document.createElement("button");

    button.type = "button";

    button.className = `client-item${
      client.id === state.activeClientId ? " active" : ""
    }`;

    button.textContent = client.name || "Klient bez názvu";

    button.addEventListener("click", () => selectClient(client.id));

    elements.clientList.append(button);
  });
}

function renderMealPlanTabs() {
  const client = activeClient();

  elements.mealPlanTabs.innerHTML = "";

  if (!client) {
    return;
  }

  client.mealPlans.forEach((plan) => {
    const button = document.createElement("button");

    button.type = "button";

    button.dataset.planId = plan.id;

    button.className = `tab${
      plan.id === state.activeMealPlanId ? " active" : ""
    }`;

    button.textContent = plan.name || "Bez názvu";

    elements.mealPlanTabs.append(button);
  });
}

function renderPlan() {
  const plan = activeMealPlan();

  if (!plan) {
    return;
  }

  elements.mealPlanTypeInput.value = plan.mealType || "Oběd";

  elements.mealPlanNameInput.value = plan.name || "";

  elements.foodTableBody.innerHTML = "";

  elements.emptyFoods.hidden = plan.foods.length > 0;

  plan.foods.forEach((food) => {
    const macros = calculateFood(food);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(food.name)}</td>
      <td>${formatNumber(food.amount)} g</td>
      <td>${formatNumber(macros.protein)} g</td>
      <td>${formatNumber(macros.fat)} g</td>
      <td>${formatNumber(macros.carbs)} g</td>
      <td class="row-actions">
        <button
          class="edit-row"
          type="button"
          aria-label="Upravit ${escapeHtml(food.name)}"
        >
          Upravit
        </button>

        <button
          class="delete-row"
          type="button"
          aria-label="Smazat ${escapeHtml(food.name)}"
        >
          Smazat
        </button>
      </td>
    `;

    row
      .querySelector(".delete-row")
      .addEventListener("click", () => deleteFood(food.id));

    row
      .querySelector(".edit-row")
      .addEventListener("click", () => editFood(food.id));

    elements.foodTableBody.append(row);
  });

  const client = activeClient();

  const totals = calculateMessageTotals(client);

  const targets = activeTargets();

  renderSummaryValue({
    valueElement: elements.totalProtein,
    progressElement: elements.proteinProgress,
    textElement: elements.proteinTargetText,
    actual: totals.protein,
    target: targets.protein,
    unit: "g",
  });

  renderSummaryValue({
    valueElement: elements.totalFat,
    progressElement: elements.fatProgress,
    textElement: elements.fatTargetText,
    actual: totals.fat,
    target: targets.fat,
    unit: "g",
  });

  renderSummaryValue({
    valueElement: elements.totalCarbs,
    progressElement: elements.carbsProgress,
    textElement: elements.carbsTargetText,
    actual: totals.carbs,
    target: targets.carbs,
    unit: "g",
  });

  renderSummaryValue({
    valueElement: elements.totalCalories,
    progressElement: elements.caloriesProgress,
    textElement: elements.caloriesTargetText,
    actual: totals.calories,
    target: targets.calories,
    unit: "kcal",
  });

  renderMessageBuilder();
  renderMessage(true);
}

function renderMessage(force) {
  const client = activeClient();

  if (!client) {
    return;
  }

  if (force || !elements.messageOutput.matches(":focus")) {
    elements.messageOutput.value = generateMessage();
  }
}

/* =========================
   CLIENT MESSAGE
   ========================= */

function generateMessage() {
  const client = activeClient();

  if (!client) {
    return "";
  }

  const selectedPlans = client.messageItems
    .map((item) => findClientMealPlanById(client, item.planId))
    .filter(Boolean);

  const sections = selectedPlans.flatMap((plan) => {
    const rows = plan.foods.map((food) => {
      const macros = calculateFood(food);

      const calories = calculateCalories(
        macros.protein,
        macros.fat,
        macros.carbs,
      );

      return (
        `• ${food.name}: ` +
        `${formatNumber(food.amount)} g - ` +
        `B ${formatNumber(macros.protein)} g, ` +
        `T ${formatNumber(macros.fat)} g, ` +
        `S ${formatNumber(macros.carbs)} g, ` +
        `${formatNumber(calories)} kcal`
      );
    });

    return [`${plan.mealType || "Jídlo"}:`, ...rows, ""];
  });

  const totals = calculateMessageTotals(client);

  return [
    "Dobrý den,",
    "",
    "posílám přehled jídelníčku:",
    "",
    ...(sections.length > 0
      ? sections
      : ["• Zatím není vybrané žádné jídlo do zprávy.", ""]),
    "Celkem:",
    `Bílkoviny: ${formatNumber(totals.protein)} g`,
    `Tuky: ${formatNumber(totals.fat)} g`,
    `Sacharidy: ${formatNumber(totals.carbs)} g`,
    `Orientační energetická hodnota: ${formatNumber(totals.calories)} kcal`,
    "",
  ].join("\n");
}
/* =========================
   HELPERS
   ========================= */

function numberValue(input) {
  return Number.parseFloat(input.value) || 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);
}

function compareCreatedAt(first, second) {
  return new Date(first.created_at) - new Date(second.created_at);
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

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2200);
}

function toggleFoodDropdown() {
  const isOpen = !elements.foodDropdown.hidden;

  if (isOpen) {
    closeFoodDropdown();
  } else {
    openFoodDropdown();
  }
}

function openFoodDropdown() {
  if (state.foods.length === 0) {
    showToast("Nejprve přidejte potravinu ve správě potravin.");
    return;
  }

  elements.foodDropdown.hidden = false;

  elements.foodSelectButton.setAttribute("aria-expanded", "true");

  elements.foodSearchInput.value = "";
  renderFoodOptions();

  elements.foodSelectButton.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  requestAnimationFrame(() => {
    elements.foodSearchInput.focus();
  });
}

function closeFoodDropdown() {
  elements.foodDropdown.hidden = true;
  elements.foodSelectButton.setAttribute("aria-expanded", "false");
}

function renderFoodOptions() {
  const query = elements.foodSearchInput.value.trim().toLocaleLowerCase("cs");

  elements.foodOptions.innerHTML = "";

  const filteredFoods = state.foods.filter(
    (food) =>
      food.name.toLocaleLowerCase("cs").includes(query) ||
      food.category.toLocaleLowerCase("cs").includes(query),
  );

  const foodsByCategory = new Map();

  filteredFoods.forEach((food) => {
    const category = food.category || "Ostatní";

    if (!foodsByCategory.has(category)) {
      foodsByCategory.set(category, []);
    }

    foodsByCategory.get(category).push(food);
  });

  [...foodsByCategory.entries()]
    .sort(([first], [second]) => first.localeCompare(second, "cs"))
    .forEach(([category, foods]) => {
      const categoryLabel = document.createElement("div");

      categoryLabel.className = "food-category-label";

      categoryLabel.textContent = category;

      elements.foodOptions.append(categoryLabel);

      foods
        .sort((first, second) => first.name.localeCompare(second.name, "cs"))
        .forEach((food) => {
          const button = document.createElement("button");

          button.type = "button";
          button.className = "food-option";
          button.setAttribute("role", "option");

          if (food.id === elements.foodSelect.value) {
            button.classList.add("active");
          }

          const calories = calculateCalories(
            food.proteinPer100,
            food.fatPer100,
            food.carbsPer100,
          );

          button.innerHTML = `
            ${escapeHtml(food.name)}
            <span class="food-option-details">
              B ${formatNumber(food.proteinPer100)} g ·
              T ${formatNumber(food.fatPer100)} g ·
              S ${formatNumber(food.carbsPer100)} g ·
              ${formatNumber(calories)} kcal
            </span>
          `;

          button.addEventListener("click", () => {
            selectCatalogFood(food);
          });

          elements.foodOptions.append(button);
        });
    });

  if (filteredFoods.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Žádná potravina nebyla nalezena.";
    elements.foodOptions.append(empty);
  }
}

function selectCatalogFood(food) {
  elements.foodSelect.value = food.id;
  elements.foodSelectLabel.textContent = food.name;

  closeFoodDropdown();
  updateFoodPreview();
}

async function sendPasswordReset() {
  const email = elements.loginEmail.value.trim();

  elements.loginError.textContent = "";

  if (!email) {
    elements.loginError.textContent = "Nejprve vyplňte e-mail.";
    return;
  }

  elements.forgotPasswordButton.disabled = true;

  const resetUrl = new URL("./reset-password.html", window.location.href).href;

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  elements.forgotPasswordButton.disabled = false;

  if (error) {
    console.error(error);

    if (error.message.toLowerCase().includes("rate limit")) {
      elements.loginError.textContent =
        "Bylo odesláno příliš mnoho e-mailů. Zkuste to prosím znovu přibližně za hodinu.";
    } else {
      elements.loginError.textContent = "Odeslání odkazu se nepodařilo.";
    }

    return;
  }

  elements.loginError.textContent =
    "Odkaz pro změnu hesla byl odeslán na e-mail.";
}

function activeTargets() {
  const client = activeClient();

  if (!client) {
    return {
      protein: 0,
      fat: 0,
      carbs: 0,
      calories: 0,
    };
  }

  return client.selectedDayType === "training"
    ? client.trainingTargets
    : client.restTargets;
}

function activeDayTypeLabel() {
  const client = activeClient();

  if (!client) {
    return "netréninkový den";
  }

  return client.selectedDayType === "training"
    ? "tréninkový den"
    : "netréninkový den";
}

async function updateSelectedDayType(dayType) {
  const client = activeClient();

  if (!client || !state.user) {
    return;
  }

  const oldDayType = client.selectedDayType;

  client.selectedDayType = dayType;

  const { error } = await supabaseClient
    .from("clients")
    .update({
      selected_day_type: dayType,
    })
    .eq("id", client.id)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);

    client.selectedDayType = oldDayType;

    showToast("Typ dne se nepodařilo uložit.");

    render();

    return;
  }

  renderTargets();
  renderPlan();
}

async function updateActiveTargets() {
  const client = activeClient();

  if (!client || !state.user) {
    return;
  }

  const targets = {
    protein: numberValue(elements.targetProtein),
    fat: numberValue(elements.targetFat),
    carbs: numberValue(elements.targetCarbs),
    calories: numberValue(elements.targetCalories),
  };

  let updatePayload;

  if (client.selectedDayType === "training") {
    client.trainingTargets = targets;

    updatePayload = {
      training_target_protein: targets.protein,
      training_target_fat: targets.fat,
      training_target_carbs: targets.carbs,
      training_target_calories: targets.calories,
    };
  } else {
    client.restTargets = targets;

    updatePayload = {
      rest_target_protein: targets.protein,
      rest_target_fat: targets.fat,
      rest_target_carbs: targets.carbs,
      rest_target_calories: targets.calories,
    };
  }

  const { error } = await supabaseClient
    .from("clients")
    .update(updatePayload)
    .eq("id", client.id)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);

    showToast("Cíle se nepodařilo uložit.");

    return;
  }

  renderPlan();
}
function renderTargets() {
  const client = activeClient();

  if (!client) {
    return;
  }

  const targets = activeTargets();

  elements.targetProtein.value = targets.protein || "";

  elements.targetFat.value = targets.fat || "";

  elements.targetCarbs.value = targets.carbs || "";

  elements.targetCalories.value = targets.calories || "";

  elements.restDayButton.classList.toggle(
    "primary",
    client.selectedDayType === "rest",
  );

  elements.restDayButton.classList.toggle(
    "secondary",
    client.selectedDayType !== "rest",
  );

  elements.trainingDayButton.classList.toggle(
    "primary",
    client.selectedDayType === "training",
  );

  elements.trainingDayButton.classList.toggle(
    "secondary",
    client.selectedDayType !== "training",
  );
}

function targetPercent(actual, target) {
  if (target <= 0) {
    return 0;
  }

  return (actual / target) * 100;
}

function targetStatusClass(actual, target) {
  if (target <= 0) {
    return "neutral";
  }

  const percent = targetPercent(actual, target);

  if (percent < 80) {
    return "low";
  }

  if (percent <= 105) {
    return "ok";
  }

  return "high";
}

function targetText(actual, target, unit) {
  if (target <= 0) {
    return `${formatNumber(actual)} ${unit}`;
  }

  return (
    `${formatNumber(actual)} / ` +
    `${formatNumber(target)} ${unit} ` +
    `(${formatNumber(targetPercent(actual, target))} %)`
  );
}
function renderSummaryValue({
  valueElement,
  progressElement,
  textElement,
  actual,
  target,
  unit,
}) {
  const percent = targetPercent(actual, target);

  if (target <= 0) {
    valueElement.textContent = `${formatNumber(actual)} ${unit}`;

    textElement.textContent = "Cíl není nastaven";

    progressElement.style.width = "0%";

    progressElement.className = "target-progress-bar neutral";

    return;
  }

  valueElement.textContent = `${formatNumber(actual)} / ${formatNumber(target)} ${unit}`;

  textElement.textContent = `Cíl: ${formatNumber(target)} ${unit}`;

  progressElement.style.width = `${Math.min(percent, 100)}%`;

  progressElement.className = `target-progress-bar ${targetStatusClass(actual, target)}`;
}

async function editFood(foodId) {
  const plan = activeMealPlan();

  if (!plan || !state.user) {
    return;
  }

  const food = plan.foods.find((item) => item.id === foodId);

  if (!food) {
    return;
  }

  const newAmountText = prompt(
    `Zadejte nové množství pro ${food.name} v gramech:`,
    String(food.amount).replace(".", ","),
  );

  if (newAmountText === null) {
    return;
  }

  const newAmount = Number.parseFloat(newAmountText.replace(",", "."));

  if (Number.isNaN(newAmount) || newAmount <= 0) {
    showToast("Zadejte platné množství.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("meal_plan_items")
    .update({
      amount: newAmount,
    })
    .eq("id", food.id)
    .eq("user_id", state.user.id)
    .select(
      `
        id,
        food_id,
        food_name,
        amount,
        protein_per_100,
        fat_per_100,
        carbs_per_100
      `,
    )
    .single();

  if (error) {
    console.error(error);

    showToast("Položku se nepodařilo upravit.");

    return;
  }

  const updatedFood = mapMealPlanItem(data);

  const foodIndex = plan.foods.findIndex((item) => item.id === foodId);

  if (foodIndex !== -1) {
    plan.foods[foodIndex] = updatedFood;
  }

  renderPlan();

  showToast("Položka byla upravena.");
}

function messageStorageKey(clientId) {
  return `macro-message-items-${state.user.id}-${clientId}`;
}

function loadMessageItems(clientId) {
  try {
    const raw = localStorage.getItem(messageStorageKey(clientId));

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function saveMessageItems(client) {
  localStorage.setItem(
    messageStorageKey(client.id),
    JSON.stringify(client.messageItems),
  );
}

function toggleMessageFoodPicker() {
  if (elements.messageFoodPicker.hidden) {
    openMessageFoodPicker();
  } else {
    closeMessageFoodPicker();
  }
}

function openMessageFoodPicker() {
  const client = activeClient();

  if (!client) {
    return;
  }

  const plans = getClientMealPlans(client);

  if (plans.length === 0) {
    showToast("Nejdřív přidejte nějaké jídlo do jídelníčku.");

    return;
  }

  renderMessageFoodPicker();

  elements.messageFoodPicker.hidden = false;
}

function renderMessageFoodPicker() {
  const client = activeClient();

  elements.messageFoodPickerList.innerHTML = "";

  if (!client) {
    return;
  }

  const plans = getClientMealPlans(client);

  plans.forEach((plan) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "message-food-option";

    const totals = calculateTotals(plan);

    button.innerHTML = `
      <span>
        <strong>${escapeHtml(plan.name)}</strong>
        <small>
          ${plan.foods.length} položek ·
          B ${formatNumber(totals.protein)} g ·
          T ${formatNumber(totals.fat)} g ·
          S ${formatNumber(totals.carbs)} g ·
          ${formatNumber(totals.calories)} kcal
        </small>
      </span>

      <span class="message-food-plus">+</span>
    `;

    button.addEventListener("click", () => addMessageItemByPlanId(plan.id));

    elements.messageFoodPickerList.append(button);
  });
}

function closeMessageFoodPicker() {
  elements.messageFoodPicker.hidden = true;
}

function renderMessageBuilder() {
  const client = activeClient();

  elements.messageBuilderList.innerHTML = "";

  if (!client) {
    return;
  }

  client.messageItems = client.messageItems.filter((item) =>
    findClientMealPlanById(client, item.planId),
  );

  saveMessageItems(client);

  elements.emptyMessageBuilder.hidden = client.messageItems.length > 0;

  client.messageItems.forEach((messageItem, index) => {
    const plan = findClientMealPlanById(client, messageItem.planId);

    if (!plan) {
      return;
    }

    const totals = calculateTotals(plan);

    const row = document.createElement("div");

    row.className = "message-builder-item";

    row.innerHTML = `
      <div>
        <strong>${escapeHtml(plan.name)}</strong>
        <small>
          ${plan.foods.length} položek ·
          B ${formatNumber(totals.protein)} g ·
          T ${formatNumber(totals.fat)} g ·
          S ${formatNumber(totals.carbs)} g ·
          ${formatNumber(totals.calories)} kcal
        </small>
      </div>

      <div class="message-builder-actions">
        <button
          class="move-up"
          type="button"
        >
          ↑
        </button>

        <button
          class="move-down"
          type="button"
        >
          ↓
        </button>

        <button
          class="remove-message-item"
          type="button"
        >
          Odebrat
        </button>
      </div>
    `;

    row
      .querySelector(".move-up")
      .addEventListener("click", () => moveMessageItem(index, -1));

    row
      .querySelector(".move-down")
      .addEventListener("click", () => moveMessageItem(index, 1));

    row
      .querySelector(".remove-message-item")
      .addEventListener("click", () => removeMessageItem(index));

    elements.messageBuilderList.append(row);
  });
}

function moveMessageItem(index, direction) {
  const client = activeClient();

  if (!client) {
    return;
  }

  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= client.messageItems.length) {
    return;
  }

  const current = client.messageItems[index];

  client.messageItems[index] = client.messageItems[targetIndex];

  client.messageItems[targetIndex] = current;

  saveMessageItems(client);

  renderPlan();
}

function removeMessageItem(index) {
  const client = activeClient();

  if (!client) {
    return;
  }

  client.messageItems.splice(index, 1);

  saveMessageItems(client);

  renderPlan();

  showToast("Jídlo bylo odebráno ze zprávy.");
}

function getClientMealPlans(client) {
  return client.mealPlans.filter((plan) => plan.foods.length > 0);
}

function findClientMealPlanById(client, planId) {
  return client.mealPlans.find((plan) => plan.id === planId) ?? null;
}

function calculateMessageTotals(client) {
  const selectedPlans = client.messageItems
    .map((item) => findClientMealPlanById(client, item.planId))
    .filter(Boolean);

  return selectedPlans.reduce(
    (sum, plan) => {
      const totals = calculateTotals(plan);

      sum.protein += totals.protein;
      sum.fat += totals.fat;
      sum.carbs += totals.carbs;
      sum.calories += totals.calories;

      return sum;
    },
    {
      protein: 0,
      fat: 0,
      carbs: 0,
      calories: 0,
    },
  );
}

function addMessageItemByPlanId(planId) {
  const client = activeClient();

  if (!client) {
    return;
  }

  const plan = findClientMealPlanById(client, planId);

  if (!plan) {
    showToast("Jídlo se nepodařilo najít.");
    return;
  }

  const alreadyAdded = client.messageItems.some(
    (item) => item.planId === planId,
  );

  if (alreadyAdded) {
    showToast("Toto jídlo už je ve zprávě přidané.");
    return;
  }

  client.messageItems.push({
    planId,
  });

  saveMessageItems(client);

  closeMessageFoodPicker();

  renderPlan();

  showToast("Jídlo bylo přidáno do zprávy.");
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

async function updateMealPlanType(event) {
  const plan = activeMealPlan();
  const mealType = event.target.value;

  if (!plan || !state.user) {
    return;
  }

  const oldMealType = plan.mealType;

  const { error } = await supabaseClient
    .from("meal_plans")
    .update({
      meal_type: mealType,
    })
    .eq("id", plan.id)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);

    event.target.value = oldMealType || "Oběd";

    showToast("Typ jídla se nepodařilo uložit.");

    return;
  }

  plan.mealType = mealType;

  renderMealPlanTabs();
  renderMessageBuilder();
  renderMessage(true);

  showToast("Typ jídla byl uložen.");
}

async function updateMealPlanName(event) {
  const plan = activeMealPlan();
  const name = event.target.value.trim();

  if (!plan || !state.user) {
    return;
  }

  if (!name) {
    event.target.value = plan.name;
    return;
  }

  const oldName = plan.name;

  const { error } = await supabaseClient
    .from("meal_plans")
    .update({
      name,
    })
    .eq("id", plan.id)
    .eq("user_id", state.user.id);

  if (error) {
    console.error(error);

    event.target.value = oldName;

    showToast("Název jídla se nepodařilo uložit.");

    return;
  }

  plan.name = name;

  renderMealPlanTabs();
  renderMessageBuilder();
  renderMessage(true);

  showToast("Název jídla byl uložen.");
}
