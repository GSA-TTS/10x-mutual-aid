const fs = require("fs");
const { parse } = require("csv-parse/sync");

module.exports = async function () {
  // Read and parse the first CSV file
  const csv1 = fs.readFileSync(
    "./_data/Annual_MABD_State_Data.csv",
    "utf8"
  );
  const data1 = parse(csv1, {
    columns: true,
    skip_empty_lines: true,
  });

  // Read and parse the second CSV file
  const csv2 = fs.readFileSync("./_data/Mutual_Aid_Contacts.csv", "utf8");
  const data2 = parse(csv2, {
    columns: true,
    skip_empty_lines: true,
  });

  // Read and parse the third CSV file
  const csv3 = fs.readFileSync("./_data/State_EMAs_Sheet.csv", "utf8");
  const data3 = parse(csv3, {
    columns: true,
    skip_empty_lines: true,
  });

  // Read and parse the CSV with the fact sheet links
  const csvFactSheet = fs.readFileSync("./_data/FEMA-Regional-MABD-Fact-Sheets-Grouped-States.csv", "utf8");
  const factSheetData = parse(csvFactSheet, {
    columns: true,
    skip_empty_lines: true,
  });

  // Organize contacts by organization and states
  let contactsByState = [];

  data2.forEach((contact) => {
    contact["States_Covered"].split(", ").forEach((state) => {
      state = state.trim();
      const orgName = contact["Results"].trim();
      let entry = contactsByState.find(
        (entry) => entry.state === state && entry.orgName === orgName
      );
      if (!entry) {
        entry = { state: state, orgName: orgName, contacts: [] };
        contactsByState.push(entry);
      }
      entry.contacts.push(contact);
    });
  });

  // Organize EMA data by state from data3
  let stateEMAs = {};
  data3.forEach((ema) => {
    const state = ema["State"].trim();
    if (!stateEMAs[state]) {
      stateEMAs[state] = [];
    }
    stateEMAs[state].push(ema);
  });

  // Create a dictionary of state to fact sheet URLs
  let stateFactSheetLinks = {};

  factSheetData.forEach((row) => {
    const states = row["States"].split(", ").map(state => state.trim());
    const link = row["Link"];
    
    states.forEach((state) => {
      stateFactSheetLinks[state] = link;  // Assign the URL to the state
    });
  });

  return {
    stantecMABD: data1,
    contactsByState,
    stateEMAs,
    stateFactSheetLinks,
  };
};