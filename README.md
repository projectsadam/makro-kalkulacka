# Makro kalkulačka

Jednoduchá statická webová aplikace pro:

- evidenci více klientů,
- vytvoření více jídelníčků pro každého klienta,
- výběr potraviny z přednastaveného katalogu,
- automatické doplnění makroživin na 100 g,
- zadávání požadovaného množství potraviny,
- výpočet celkových bílkovin, tuků, sacharidů a orientační energie,
- vygenerování zprávy pro klienta,
- automatické ukládání dat do `localStorage`,
- export a import všech dat ve formátu JSON.

## Lokální spuštění

Stačí otevřít soubor `index.html` v prohlížeči.

Pro pohodlnější vývoj lze ve složce spustit například:

```bash
python3 -m http.server 8000
```

A poté otevřít `http://localhost:8000`.

## Nasazení na GitHub Pages

1. Vytvořte nový repozitář.
2. Nahrajte do něj soubory `index.html`, `styles.css` a `app.js`.
3. Otevřete **Settings → Pages**.
4. V části **Build and deployment** zvolte **Deploy from a branch**.
5. Vyberte větev `main` a složku `/ (root)`.
6. Uložte nastavení.

## Ukládání dat

Data se ukládají do `localStorage` konkrétního prohlížeče a zařízení.

To znamená:

- po obnovení stránky zůstanou zachována,
- nejsou automaticky dostupná na jiném počítači nebo telefonu,
- vymazání dat prohlížeče je odstraní,
- zálohu lze vytvořit tlačítkem **Exportovat data**,
- zálohu lze obnovit tlačítkem **Importovat data**.

Pro synchronizaci mezi zařízeními a přihlašování by bylo potřeba připojit backend/databázi, například Supabase nebo Firebase.
