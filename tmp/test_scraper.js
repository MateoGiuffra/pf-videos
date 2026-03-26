const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function parseResourcesHtml(html) {
  const $ = cheerio.load(html);
  const sectionsMap = {};

  // Find all resource activities
  const $resources = $('li.activity.resource, li.modtype_resource');

  $resources.each((_, resourceElem) => {
    const $res = $(resourceElem);
    const $link = $res.find('a.aalink.stretched-link');
    const url = $link.attr('href') || '';
    
    if (!url) return;

    const $instanceName = $res.find('.instancename');
    let title = '';
    
    if ($instanceName.length > 0) {
      const $clean = $instanceName.clone();
      $clean.find('.accesshide').remove();
      title = $clean.text().trim();
    } else {
      title = $res.find('.activityname').text().replace(/Archivo$/, '').trim();
    }

    if (!title) return;

    const resourceId = $res.attr('data-id') || url.split('id=')[1] || '';
    
    const $section = $res.closest('li.section.main');
    let displaySectionTitle = $section.find('.sectionname, h3').first().text().trim();
    const sectionId = $section.attr('data-id') || $section.attr('id') || 'general';
    let groupTitle = displaySectionTitle;

    // Handle nested section titles
    if (displaySectionTitle === 'Parte teórica' || displaySectionTitle === 'Parte práctica') {
      const $parentSection = $section.parents('li.section.main').first();
      if ($parentSection.length > 0) {
        const parentTitle = $parentSection.find('.sectionname, h3').first().text().trim();
        if (parentTitle) {
          groupTitle = parentTitle;
          displaySectionTitle = `${parentTitle} - ${displaySectionTitle}`;
        }
      }
    }

    if (!groupTitle || groupTitle === 'General') {
      groupTitle = 'Otros recursos';
      displaySectionTitle = groupTitle;
    }

    let type = 'other';
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('práctica')) {
      type = 'practice';
    } else if (lowercaseTitle.includes('teoría') || lowercaseTitle.includes('diapositiva')) {
      type = 'theory';
    }

    if (!sectionsMap[groupTitle]) {
      sectionsMap[groupTitle] = {
        id: sectionId,
        title: groupTitle,
        resources: []
      };
    }

    if (!sectionsMap[groupTitle].resources.find(r => r.id === resourceId)) {
      sectionsMap[groupTitle].resources.push({
        id: resourceId,
        title,
        url,
        type,
        unit: displaySectionTitle
      });
    }
  });

  return Object.values(sectionsMap);
}

const htmlPath = path.join(__dirname, '..', 'data', 'id_70.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const results = parseResourcesHtml(html);

console.log(JSON.stringify(results, null, 2));
console.log(`Total units: ${results.length}`);
console.log(`Total resources: ${results.reduce((acc, s) => acc + s.resources.length, 0)}`);
