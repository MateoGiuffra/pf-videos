import * as cheerio from 'cheerio';
import { ENV } from '@/config/env';

const AULAS_URL = ENV.AULAS_URL;
const COURSE_ID = 70;

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'practice' | 'theory' | 'other';
  unit: string;
}

export interface Section {
  id: string;
  title: string;
  resources: Resource[];
}

export async function scrapeResources(moodleSessionCookie?: string): Promise<Section[]> {
  try {
    // 1. Fetch course page
    const courseUrl = `${AULAS_URL}/course/view.php?id=${COURSE_ID}`;
    const response = await fetch(courseUrl, {
      headers: {
        'Cookie': moodleSessionCookie || '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch course page: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`[Scraper] Fetched ${html.length} characters from ${courseUrl}`);
    
    // Check if we were redirected to login
    if (html.includes('id="login"') || html.includes('login/index.php') || html.includes('form-login')) {
      console.warn('[Scraper] Redirected to login page. Session expired.');
      throw new Error('La sesión de Moodle ha expirado. Por favor, cierra sesión y vuelve a ingresar.');
    }

    const sections = parseResourcesHtml(html);
    console.log(`[Scraper] Parsed ${sections.length} sections and ${sections.reduce((acc, s) => acc + s.resources.length, 0)} resources.`);
    return sections;
  } catch (error) {
    console.error('[Scraper Error]:', error);
    throw error;
  }
}

export function parseResourcesHtml(html: string): Section[] {
  const $ = cheerio.load(html);
  const sectionsMap: Record<string, Section> = {};

  // Find all resource activities
  const $resources = $('li.activity.resource, li.modtype_resource');
  
  if ($resources.length === 0) {
    console.warn('[Scraper] No resources found with current selectors.');
  }

  $resources.each((_, resourceElem) => {
    const $res = $(resourceElem);
    const $link = $res.find('a.aalink.stretched-link');
    let url = $link.attr('href') || '';
    
    if (!url) return;
    url = `${url}&redirect=1`;
    // Extract title and clean it
    const $instanceName = $res.find('.instancename');
    let title = '';
    
    if ($instanceName.length > 0) {
      // Re-implement cleaning without mutating the whole DOM if possible
      const $clean = $instanceName.clone();
      $clean.find('.accesshide').remove();
      title = $clean.text().trim();
    } else {
      title = $res.find('.activityname').text().replace(/Archivo$/, '').trim();
    }

    if (!title) return;

    const resourceId = $res.attr('data-id') || url.split('id=')[1] || '';
    
    // Find the closest section
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

    // Determine type
    let type: 'practice' | 'theory' | 'other' = 'other';
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
