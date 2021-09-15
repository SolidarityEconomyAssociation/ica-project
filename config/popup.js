"use strict";

function getLatLng(initiative) {
  return [initiative.lat, initiative.lng];
};
function getHoverText(initiative) {
  return initiative.name;
};
function prettyPhone(tel) {
  return tel.replace(/^(\d)(\d{4})\s*(\d{6})/, "$1$2 $3");
};
function getAddress(initiative, getTerm) {
  // We want to add the whole address into a single para
  // Not all orgs have an address
  let address = "";
  let street;
  if (initiative.street) {
    let streetArray = initiative.street.split(";");
    for (let partial of streetArray) {
      if (partial === initiative.name) continue;
      if (street) street += "<br/>";
      street = street ? (street += partial) : partial;
    }
    address += street;
  }
  if (initiative.locality) {
    address += (address.length ? "<br/>" : "") + initiative.locality;
  }
  if (initiative.region) {
    address += (address.length ? "<br/>" : "") + initiative.region;
  }
  if (initiative.postcode) {
    address += (address.length ? "<br/>" : "") + initiative.postcode;
  }
  if (initiative.countryId) {
    const countryName = getTerm('countryId');
    address += (address.length ? "<br/>" : "") + (countryName || initiative.countryId);
  }
  if (initiative.nongeo == 1 || !initiative.lat || !initiative.lng) {
    address += (address.length ? "<br/>" : "") + "<i>NO LOCATION AVAILABLE</i>";
  }
  if (address.length) {
    address = '<p class="sea-initiative-address">' + address + "</p>";
  }
  return address;
}

function getSecondaryActivities(initiative, acVocab, osVocab) {
  const title = "Secondary Activities"; // FIXME not yet translated!

  if (initiative.activities && initiative.activities.length > 0) {
    const term = initiative.activities.map(id => acVocab.terms[id]).join(", ");
    return `${title}: ${term}`;
  }
  
  if (initiative.activity) {
    return `${title}: ${osVocab.terms[initiative.activity]}`;
  }

  return '';
}

function getEmail(initiative) {
  // Not all orgs have an email
  if (initiative.email)
    return `<a class="fa fa-at" href="mailto:${initiative.email}" target="_blank" ></a>`;
  return "";
}

function getPopup(initiative, sse_initiatives) {
  function getTerm(propertyName) {
    const vocabUri = sse_initiatives.getVocabUriForProperty(propertyName);
    return sse_initiatives.getVocabTerm(vocabUri, initiative[propertyName]);
  }
  
  const values = sse_initiatives.getLocalisedVocabs();
  const labels = sse_initiatives.getFunctionalLabels();
  let orgStructures = values["os:"].terms;
  let activitiesVerbose = values["aci:"].terms;
  let membershipsVerbose = values["bmt:"].terms;
  let os_title = values["os:"].title;
  let bmt_title = values["bmt:"].title;
  let aci_title = values["aci:"].title;
  
  // Initiative's dotcoop domains. Note, not all have a website.
  let dotcoop_domains = "";
  if (initiative.www)
    dotcoop_domains = `<a href="${initiative.www}" target="_blank" >${initiative.www}</a>`;
  
  let dotcoop = initiative.dataset.includes("dotcoop");
  let popupHTML = `
    <div class="sea-initiative-details">
      <h2 class="sea-initiative-name">${initiative.name}</h2>
      ${dotcoop_domains || ''}
      <h4 class="sea-initiative-org-structure">${values["os:"].title}: ${orgStructures[initiative.regorg]}</h4>
      <h4 class="sea-initiative-org-typology">${values["bmt:"].title}: ${membershipsVerbose[initiative.baseMembershipType]}</h4>
      <h4 class="sea-initiative-economic-activity">${values["aci:"].title}: ${activitiesVerbose[initiative.primaryActivity]}</h4>
      <h5 class="sea-initiative-secondary-activity">${getSecondaryActivities(initiative, values["aci:"], values["os:"])}</h5>
      <p>${initiative.desc || ''}</p>
    </div>
    
    <div class="sea-initiative-contact">
      <h3>${labels.contact}</h3>
      ${getAddress(initiative, getTerm)}
      
      <div class="sea-initiative-links">
        ${getEmail(initiative)}
        {initiative.facebook}
        {initiative.twitter}
      </div>
    </div>
  `;

  // TODO Add org type
  if (!initiative.qualifier && initiative.orgStructure && initiative.orgStructure.length > 0) {
    let repl = initiative.orgStructure.map(OS => orgStructures[OS]).join(", ");
    popupHTML = popupHTML.replace(
      "{initiative.org-structure}",
      repl
    );
  }
  else {
    if (!initiative.qualifier && initiative.regorg) {
      popupHTML = popupHTML.replace(
        "{initiative.org-structure}",
        orgStructures[initiative.regorg]
      );
    } else {
      popupHTML = popupHTML.replace(
        "Structure Type: {initiative.org-structure}",
        initiative.qualifier ? "Structure Type: " + activitiesVerbose[initiative.qualifier] : ""
      );
    }

  }

  if (initiative.primaryActivity && initiative.primaryActivity != "") {

    popupHTML = popupHTML.replace(
      "{initiative.economic-activity}",
      activitiesVerbose[initiative.primaryActivity]
    );
  } else {
    popupHTML = popupHTML.replace(
      "Economic Activity: {initiative.economic-activity}",
      ""
    );

  }

  // memberships 
  if (initiative.baseMembershipType) {
    popupHTML = popupHTML.replace(
      "Typology: {initiative.org-baseMembershipType}",
      "Typology: " + membershipsVerbose[initiative.baseMembershipType]
    )
  }
  else {
    popupHTML = popupHTML.replace(
      "Typology: {initiative.org-baseMembershipType}", "Others"
    )
  }

  // not all have twitter
  if (initiative.twitter) {
    popupHTML = popupHTML.replace(
      "{initiative.twitter}",
      '<a class="fab fa-twitter" href="https://twitter.com/' + initiative.twitter + '" target="_blank" ></a>'
    );
  } else popupHTML = popupHTML.replace("{initiative.twitter}", "");

  // not all have a facebook
  if (initiative.facebook) {
    popupHTML = popupHTML.replace(
      "{initiative.facebook}",
      '<a class="fab fa-facebook" href="https://facebook.com/' + initiative.facebook + '" target="_blank" ></a>'
    );
  } else popupHTML = popupHTML.replace("{initiative.facebook}", "");


  return popupHTML;
};

module.exports = {
  getPopup
};
