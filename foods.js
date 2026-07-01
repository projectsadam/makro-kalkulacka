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

const state = {
  user: null,
  foods: [],
  editingFoodId: null,
};

const elements = {
  application:
    document.querySelector("#foodsApplication"),

  logoutButton:
    document.querySelector("#logoutButton"),

  form:
    document.querySelector("#catalogFoodForm"),

  formTitle:
    document.querySelector("#catalogFoodFormTitle"),

  name:
    document.querySelector("#catalogFoodName"),

  category:
    document.querySelector("#catalogFoodCategory"),

  protein:
    document.querySelector("#catalogFoodProtein"),

  fat:
    document.querySelector("#catalogFoodFat"),

  carbs:
    document.querySelector("#catalogFoodCarbs"),

  saveButton:
    document.querySelector("#saveCatalogFoodButton"),

  cancelEditButton:
    document.querySelector("#cancelFoodEditButton"),

  foodList:
    document.querySelector("#catalogFoodList"),

  foodCount:
    document.querySelector("#catalogFoodCount"),

  emptyFoods:
    document.querySelector("#emptyCatalogFoods"),

  toast:
    document.querySelector("#toast"),
};

registerEventListeners();
initializePage();

function registerEventListeners() {
  elements.form.addEventListener(
    "submit",
    saveFood
  );

  elements.cancelEditButton.addEventListener(
    "click",
    resetForm
  );

  elements.logoutButton.addEventListener(
    "click",
    logout
  );
}

/* =========================
   INITIALIZATION
   ========================= */

async function initializePage() {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
    redirectToLogin();
    return;
  }

  if (!session?.user) {
    redirectToLogin();
    return;
  }

  state.user = session.user;

  elements.application.hidden = false;

  await loadFoods();
}

function redirectToLogin() {
  window.location.href = "index.html";
}

/* =========================
   AUTHENTICATION
   ========================= */

async function logout() {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
    showToast("Odhlášení se nepodařilo.");
    return;
  }

  window.location.href = "index.html";
}

/* =========================
   DATABASE
   ========================= */

async function loadFoods() {
  const { data, error } =
    await supabaseClient
      .from("foods")
      .select(`
        id,
        name,
        category,
        protein_per_100,
        fat_per_100,
        carbs_per_100,
        created_at
      `)
      .eq("user_id", state.user.id)
      .order("category", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

  if (error) {
    console.error(error);

    showToast(
      "Potraviny se nepodařilo načíst."
    );

    return;
  }

  state.foods =
    (data ?? []).map(mapFood);

  renderFoods();
}

async function saveFood(event) {
  event.preventDefault();

  const foodData = readForm();

  if (!foodData) {
    return;
  }

  elements.saveButton.disabled = true;

  try {
    if (state.editingFoodId) {
      await updateFood(foodData);
    } else {
      await createFood(foodData);
    }
  } finally {
    elements.saveButton.disabled = false;
  }
}

async function createFood(foodData) {
  const { data, error } =
    await supabaseClient
      .from("foods")
      .insert({
        user_id: state.user.id,
        ...foodData,
      })
      .select(`
        id,
        name,
        category,
        protein_per_100,
        fat_per_100,
        carbs_per_100
      `)
      .single();

  if (error) {
    console.error(error);

    showToast(
      "Potravinu se nepodařilo přidat."
    );

    return;
  }

  state.foods.push(
    mapFood(data)
  );

  resetForm();
  renderFoods();

  showToast("Potravina byla přidána.");
}

async function updateFood(foodData) {
  const foodId =
    state.editingFoodId;

  if (!foodId) {
    return;
  }

  const { data, error } =
    await supabaseClient
      .from("foods")
      .update(foodData)
      .eq("id", foodId)
      .eq("user_id", state.user.id)
      .select(`
        id,
        name,
        category,
        protein_per_100,
        fat_per_100,
        carbs_per_100
      `)
      .single();

  if (error) {
    console.error(error);

    showToast(
      "Potravinu se nepodařilo upravit."
    );

    return;
  }

  const updatedFood =
    mapFood(data);

  state.foods =
    state.foods.map(food =>
      food.id === updatedFood.id
        ? updatedFood
        : food
    );

  resetForm();
  renderFoods();

  showToast("Potravina byla upravena.");
}

async function deleteFood(foodId) {
  const food = state.foods.find(
    item => item.id === foodId
  );

  if (!food) {
    return;
  }

  const confirmed = confirm(
    `Opravdu chcete smazat potravinu „${food.name}“?`
  );

  if (!confirmed) {
    return;
  }

  const { error } =
    await supabaseClient
      .from("foods")
      .delete()
      .eq("id", food.id)
      .eq("user_id", state.user.id);

  if (error) {
    console.error(error);

    showToast(
      "Potravinu se nepodařilo smazat."
    );

    return;
  }

  state.foods =
    state.foods.filter(
      item => item.id !== food.id
    );

  if (state.editingFoodId === food.id) {
    resetForm();
  }

  renderFoods();

  showToast("Potravina byla smazána.");
}

/* =========================
   FORM
   ========================= */

function readForm() {
  const name =
    elements.name.value.trim();

  const category =
    elements.category.value.trim()
    || "Ostatní";

  const protein =
    Number(elements.protein.value);

  const fat =
    Number(elements.fat.value);

  const carbs =
    Number(elements.carbs.value);

  const valuesAreValid =
    name
    && Number.isFinite(protein)
    && Number.isFinite(fat)
    && Number.isFinite(carbs)
    && protein >= 0
    && fat >= 0
    && carbs >= 0;

  if (!valuesAreValid) {
    showToast(
      "Vyplňte správně všechny hodnoty."
    );

    return null;
  }

  return {
    name,
    category,
    protein_per_100: protein,
    fat_per_100: fat,
    carbs_per_100: carbs,
  };
}

function startEditingFood(foodId) {
  const food = state.foods.find(
    item => item.id === foodId
  );

  if (!food) {
    return;
  }

  state.editingFoodId = food.id;

  elements.name.value =
    food.name;

  elements.category.value =
    food.category;

  elements.protein.value =
    food.proteinPer100;

  elements.fat.value =
    food.fatPer100;

  elements.carbs.value =
    food.carbsPer100;

  elements.formTitle.textContent =
    "Upravit potravinu";

  elements.saveButton.textContent =
    "Uložit změny";

  elements.cancelEditButton.hidden =
    false;

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  elements.name.focus();
}

function resetForm() {
  state.editingFoodId = null;

  elements.form.reset();

  elements.formTitle.textContent =
    "Přidat potravinu";

  elements.saveButton.textContent =
    "Přidat potravinu";

  elements.cancelEditButton.hidden =
    true;
}

/* =========================
   RENDERING
   ========================= */

function renderFoods() {
  elements.foodList.innerHTML = "";

  const sortedFoods =
    [...state.foods].sort(
      (first, second) => {
        const categoryComparison =
          first.category.localeCompare(
            second.category,
            "cs"
          );

        if (categoryComparison !== 0) {
          return categoryComparison;
        }

        return first.name.localeCompare(
          second.name,
          "cs"
        );
      }
    );

  elements.foodCount.textContent =
    String(sortedFoods.length);

  elements.emptyFoods.hidden =
    sortedFoods.length > 0;

  sortedFoods.forEach(food => {
    const card =
      document.createElement("article");

    card.className =
      "catalog-food-item";

    const calories =
      calculateCalories(
        food.proteinPer100,
        food.fatPer100,
        food.carbsPer100
      );

    card.innerHTML = `
      <div class="catalog-food-info">
        <div>
          <strong>${escapeHtml(food.name)}</strong>
          <span>${escapeHtml(food.category)}</span>
        </div>

        <div class="catalog-food-macros">
          <span>
            B ${formatNumber(food.proteinPer100)} g
          </span>

          <span>
            T ${formatNumber(food.fatPer100)} g
          </span>

          <span>
            S ${formatNumber(food.carbsPer100)} g
          </span>

          <span>
            ${formatNumber(calories)} kcal
          </span>
        </div>
      </div>

      <div class="catalog-food-actions">
        <button
          class="button secondary edit-food"
          type="button"
        >
          Upravit
        </button>

        <button
          class="button danger delete-food"
          type="button"
        >
          Smazat
        </button>
      </div>
    `;

    card
      .querySelector(".edit-food")
      .addEventListener(
        "click",
        () => startEditingFood(food.id)
      );

    card
      .querySelector(".delete-food")
      .addEventListener(
        "click",
        () => deleteFood(food.id)
      );

    elements.foodList.append(card);
  });
}

/* =========================
   HELPERS
   ========================= */

function mapFood(food) {
  return {
    id: food.id,
    name: food.name,

    category:
      food.category || "Ostatní",

    proteinPer100:
      Number(food.protein_per_100),

    fatPer100:
      Number(food.fat_per_100),

    carbsPer100:
      Number(food.carbs_per_100),
  };
}

function calculateCalories(
  protein,
  fat,
  carbs
) {
  return (
    protein * 4
    + carbs * 4
    + fat * 9
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat(
    "cs-CZ",
    {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    }
  ).format(value);
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

  toastTimer = setTimeout(
    () => {
      elements.toast.classList.remove(
        "visible"
      );
    },
    2200
  );
}