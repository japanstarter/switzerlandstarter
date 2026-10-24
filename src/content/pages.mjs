export function pages(config) {
  const n = config.name;
  const email = config.contactEmail ? `<a href="mailto:${config.contactEmail}">${config.contactEmail}</a>` : `our <a href="/contact/">contact form</a>`;
  const updated = "October 23, 2026";
  return [
{ url: "/about/", title: `About ${n}`, lead: "Who we are and how we put our guides together.", description: `About ${n}: an independent, ad-supported Switzerland travel guide and how we research and update our content.`,
  body: `<h2>What this site is</h2><p>${n} is an independent, start-here travel guide for visitors to Switzerland, written especially with first-time travellers in mind. We publish destination guides, practical how-tos, itineraries and free planning tools. The site is free to use and is supported by advertising.</p>
<h2>How we research</h2><ul><li>We base practical information on official sources — JNTO, Switzerland Railways companies, the Ministry of Foreign Affairs, Immigration Services Agency and local tourism bodies — and link to them so you can check details yourself.</li><li>Prices are approximate and change; we say so wherever we give one.</li><li>We do not publish paid reviews or invented testimonials.</li></ul>
<h2>Independence</h2><p>We are not affiliated with JNTO, any Switzerland Railways company, or any government body. Advertising is served by third parties and does not influence our editorial content. If we ever add affiliate links, we'll label them clearly.</p>
<h2>Corrections</h2><p>Spotted something out of date? Please tell us via ${email} — we'd be grateful.</p>` },
{ url: "/contact/", title: "Contact us", lead: "Questions, corrections or partnership enquiries.", description: `Contact ${n} with corrections, questions or partnership enquiries.`,
  body: `<p>We read every message. We can't provide personalised trip planning or booking help, but we welcome corrections and suggestions.</p>
<form name="contact" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field" class="contact-form">
<input type="hidden" name="form-name" value="contact">
<p class="sr"><label>Don't fill this out: <input name="bot-field"></label></p>
<p><label for="c-name">Name</label><input id="c-name" name="name" type="text" required autocomplete="name"></p>
<p><label for="c-email">Email</label><input id="c-email" name="email" type="email" required autocomplete="email"></p>
<p><label for="c-topic">Topic</label><select id="c-topic" name="topic"><option>Correction</option><option>Question</option><option>Advertising / partnership</option><option>Other</option></select></p>
<p><label for="c-msg">Message</label><textarea id="c-msg" name="message" rows="6" required></textarea></p>
<p><button type="submit">Send message</button></p>
</form>
<p class="note">By submitting, you agree that we may store your message to respond to you, as described in our <a href="/privacy-policy/">Privacy Policy</a>.</p>` },
{ url: "/thank-you/", title: "Thank you", lead: "Your message has been sent.", description: "Thank you for contacting us.", noindex: true,
  body: `<p>Thanks for getting in touch. We'll reply if your message needs a response. In the meantime, browse our <a href="/guides/">travel guides</a> or <a href="/destinations/">destinations</a>.</p>` },
{ url: "/privacy-policy/", title: "Privacy Policy", lead: `Last updated: ${updated}`, description: `Privacy policy for ${n}, including cookies, Google AdSense advertising and your choices.`,
  body: `<h2>Overview</h2><p>This policy explains what information ${n} ("we", "us") collects when you use this website, how it is used, and your choices.</p>
<h2>Information we collect</h2><ul><li><strong>Contact form:</strong> if you contact us, we receive the name, email address and message you submit. Forms are processed securely by our hosting provider.</li><li><strong>Server logs:</strong> our host may process technical data such as IP address, browser type and pages requested, for security and operation.</li><li><strong>Cookies and local storage:</strong> we use your browser's local storage to remember that you dismissed the cookie notice and to save tool inputs on your device. Third-party advertising partners may set cookies as described below.</li></ul>
<h2>Advertising (Google AdSense)</h2><p>We may use Google AdSense to show ads. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</p><p>You may opt out of personalised advertising by visiting <a href="https://adssettings.google.com/" rel="noopener">Google Ads Settings</a>. You can also opt out of some third-party vendors' use of cookies for personalised advertising at <a href="https://www.aboutads.info/" rel="noopener">www.aboutads.info</a>. Learn more about <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">how Google uses information from sites that use its services</a>.</p><p>Where required by law (for example in the EEA, UK and Switzerland), we will ask for your consent before personalised advertising cookies are used, through a consent management platform.</p>
<h2>Analytics</h2><p>If we add analytics, we'll update this policy to name the provider and explain your choices.</p>
<h2>How we use information</h2><ul><li>To operate, secure and improve the site</li><li>To respond to your messages</li><li>To show advertising that funds the site</li></ul><p>We do not sell personal information collected through our contact form.</p>
<h2>Retention</h2><p>Contact messages are kept only as long as needed to respond and for reasonable record-keeping.</p>
<h2>Your rights</h2><p>Depending on where you live (for example under the GDPR, UK GDPR or California law), you may have rights to access, correct, delete or object to the processing of your personal data. Contact us via ${email} to make a request.</p>
<h2>Children</h2><p>This site is not directed at children under 13 and we don't knowingly collect their personal information.</p>
<h2>Third-party links</h2><p>We link to official and third-party websites. Their privacy practices are their own.</p>
<h2>Changes</h2><p>We may update this policy and will revise the "last updated" date above.</p>
<h2>Contact</h2><p>Questions about privacy? Reach us via ${email}.</p>` },
{ url: "/terms/", title: "Terms of Use", lead: `Last updated: ${updated}`, description: `Terms of use for ${n}.`,
  body: `<h2>Use of this site</h2><p>By using ${n} you agree to these terms. The content is provided for general information only.</p>
<h2>No guarantee of accuracy</h2><p>Travel information — including entry requirements, prices, timetables, opening hours and safety conditions — changes frequently. While we try to keep content current, we make no warranty that it is accurate, complete or up to date. Always confirm with official sources before making travel decisions or purchases.</p>
<h2>Not professional advice</h2><p>Nothing on this site is legal, immigration, medical, or financial advice.</p>
<h2>Tools</h2><p>Our calculators produce rough estimates using approximate figures you can edit. They are not quotes.</p>
<h2>Third-party content and ads</h2><p>We display third-party advertisements and link to external websites. We're not responsible for their content, products or services.</p>
<h2>Intellectual property</h2><p>Text and original illustrations on this site are owned by ${n}. You may share links and brief quotes with attribution; please don't republish whole articles without permission.</p>
<h2>Limitation of liability</h2><p>To the extent permitted by law, ${n} is not liable for any loss or damage arising from use of this site or reliance on its content.</p>
<h2>Changes</h2><p>We may update these terms at any time. Continued use of the site means you accept the current terms.</p>` },
  ];
}
