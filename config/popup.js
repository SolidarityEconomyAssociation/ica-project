"use strict";

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

function getDotcoopDomains(initiative) {
  // Initiative's dotcoop domains. Note, not all have a website.
  if (initiative.www)
    return `<a href="${initiative.www}" target="_blank" >${initiative.www}</a>`;
  return '';
}

function getBMT(initiative, bmtVocab) {
  if (initiative.baseMembershipType) {
    return `${bmtVocab.title}: ${bmtVocab.terms[initiative.baseMembershipType]}`;
  }
  
  return `${bmtVocab.title}: Others`;
}

function getOrgStructure(initiative, osVocab, acVocab, qfVocab) {
  if (!initiative.qualifier && initiative.orgStructure && initiative.orgStructure.length > 0) {
    const terms = initiative.orgStructure.map(id => osVocab.terms[id]).join(", ");
    return `${osVocab.title}: ${terms}`;
  }

  if (!initiative.qualifier && initiative.regorg) {
    if (!osVocab.terms[initiative.regorg])
      console.error(`Unknown ${osVocab.title} vocab term ID: ${initiative.regorg}`);
    return `${osVocab.title}: ${osVocab.terms[initiative.regorg]}`;
  }
  
  if (initiative.qualifier) {
    if (!qfVocab.terms[initiative.qualifier])
      console.error(`Unknown ${qfVocab.title} vocab term ID: ${initiative.qualifier}`);
    return `${osVocab.title}: ${qfVocab.terms[initiative.qualifier]}`;
  }

  return '';
}

function getPrimaryActivity(initiative, acVocab) {
  if (initiative.primaryActivity && initiative.primaryActivity != "") {
    return `${acVocab.title}: ${acVocab.terms[initiative.primaryActivity]}`;
  }
  
  return '';
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

function getFacebook(initiative) {
  // not all have a facebook
  if (initiative.facebook)
    return `<a class="fab fa-facebook" href="https://facebook.com/${initiative.facebook}" target="_blank" ></a>`;
  return "";
}  

function getTwitter(initiative) {
  // not all have twitter
  if (initiative.twitter)
    return `<a class="fab fa-twitter" href="https://twitter.com/${initiative.twitter}" target="_blank" ></a>`;
  return '';
}

function getPopup(initiative, sse_initiatives) {
  function getTerm(propertyName) {
    const vocabUri = sse_initiatives.getVocabUriForProperty(propertyName);
    return sse_initiatives.getVocabTerm(vocabUri, initiative[propertyName]);
  }
  
  const values = sse_initiatives.getLocalisedVocabs();
  const labels = sse_initiatives.getFunctionalLabels();
  let popupHTML = `
    <div class="sea-initiative-details">
      <h2 class="sea-initiative-name">${initiative.name}</h2>
      ${getDotcoopDomains(initiative)}
      <h4 class="sea-initiative-org-structure">${getOrgStructure(initiative, values["os:"], values["aci:"], values["qf:"])}</h4>
      <h4 class="sea-initiative-org-typology">${getBMT(initiative, values["bmt:"])}</h4>
      <h4 class="sea-initiative-economic-activity">${getPrimaryActivity(initiative, values["aci:"])}</h4>
      <h5 class="sea-initiative-secondary-activity">${getSecondaryActivities(initiative, values["aci:"], values["os:"])}</h5>
      <p>${initiative.desc || ''}</p>
    </div>
    
    <div class="sea-initiative-contact">
      <h3>${labels.contact}</h3>
      ${getAddress(initiative, getTerm)}
      
      <div class="sea-initiative-links">
        ${getEmail(initiative)}
        ${getFacebook(initiative)}
        ${getTwitter(initiative)}
      </div>
    </div>
  `;
  
  return popupHTML;
};

module.exports = {
  getPopup
};
