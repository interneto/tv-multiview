# Changelog

## [v0.20]

- Changed
    - Translate to English
    - Remove extra buttons (time)
    - Simplify interface
    - Reduce redundant channels and add more famous
    - Create new default channels
    - Simplify convert from json to m3u
    - Add tools to check, validate and create reports

## [v0.19]

- Changed
    - Updated README.md and NOTICE.md files to improve readability and link formatting.
    - Functions moved to modules for better organization.
    - Applied functions to check for the existence of elements and methods before operating on them in multiple JS files to avoid runtime errors.

- Added
    - Added checks for the existence of elements and methods before operating on them in multiple JS files to avoid runtime errors.
    - Improved compatibility and robustness in DOM manipulation, events, and local storage.
    - lite-youtube-embed for YouTube loading for yt_embed and yt_playlist cases.

- Fixed
    - Overflow of countries buttons in modals to change active channel.
    - Suspension of m3u8 signals loaded with VideoJS correctly, so that they do not continue in the background after removing the element from the DOM.

## [v0.18]

- Changed
    - Refactored JS code.
    - Combined signals for the same channel into a single button.
    - Preview images

- Added
    - Option to modify active channel signal, along with saving the selected option to local storage for future loads.
    - Increased number of checks for channel loading to avoid errors that render the site unusable.
    - Experimental option to load IPTV channels from [https://github.com/iptv-org/iptv](https://github.com/iptv-org/iptv) (due to performance issues, leave it manually enabled in offcanvas customizations).
    - More channels, signals, logos for channels (optional from code).
    - Option to switch between "grid" and "single" view, along with remembering the selected option.
    - Option to switch to 100% screen height in "grid" view.

## [v0.17]

- Changed
    - Rewrote channel filter to take into account if the filter by country is pressed so that the user input is within that active country.
    - F_ordenBotones rewritten to include dynamic modal for changing active signal, saving the original order of buttons before sorting in ascending/descending order.
    - Active channel container div now uses 100vh.
    - Global redesign
    - PWA manifesto images and repository preview (thanks to [https://shots.so/](https://shots.so/), [https://pixlr.com/es/express/,](https://pixlr.com/es/express/) and [https://progressier.com/pwa-screenshots-generator](https://progressier.com/pwa-screenshots-generator))
    - JS structure by modules

- Added
    - PWA install button using [https://github.com/khmyznikov/pwa-install](https://github.com/khmyznikov/pwa-install)
    - Alert when internet connection is lost
    - Hide overlay button text according to general div size to avoid overflow in small sizes
    - Buttons for loading default channels
    - Sound effect for default channel load buttons [CRT turn on notification by Coolshows101sound](https://freesound.org/people/Coolshows101sound/sounds/709461/)
    - Icons for buttons to remove all active channels, navbar items, credits, and disclaimer
    - Ability to move floating buttons
    - Ability to individually hide channel overlay buttons
    - Observer for cases where there are only 2 or 1 active channels, adjust column size accordingly to cover the entire width

- Removed
    - js/json file with channels (created &lt;<https://github.com/Alplox/json-tv>&gt; to fetch, leaving the last file that existed in the repository as a backup)

- Fixed
    - Option to enter full screen (bug <<https://github.com/Alplox/teles/issues/1>&gt; if entered with the enlarge icon from a browser, it remains, but the problem is not unique to the site, so it is left as it is because globally (from what I saw) there is no solution) with the F11 key working as expected.

## [v0.16]

- Changed
    - CSS: &lt;a&gt;:focus and &lt;a&gt;:hover
    - PWA manifest
    - CSS: .barra-overlay because its content was not properly centered
    - .barra-overlay adds tabindex=0 so that it can be focused using the TAB key
    - Text: from "Disable" to "Remove" in the channels modal (to match the remove button on the signals)
    - Separate share buttons from copy link bar (so that modal shows copy link to people with ad blockers)
    - Rewritten "NOTICE.md" file
    - Alert after localStorage deletion
    - SVG social media logos replaced with Bootstrap icons
    - Example images on README.md, index.html, and site.webmanifest according to new version

- Added
    - Icon to external links within active signal &lt;iframe&gt; for better communication that clicking will leave the site &lt;i class="bi bi-box-arrow-up-right"&gt;&lt;/i&gt;
    - Contributors section in "README.md"
    - Ability to reorder channels with plugin from [SortableJS](https://github.com/SortableJS/Sortable) grid
    - Icon for contributions in modal credits and README.md with [contributors-img](https://github.com/lacolaco/contributors-img)
    - Sound effects for link copy alert in share modal: [button-pressed by Pixabay](https://pixabay.com/sound-effects/button-pressed-38129/), [Cancel/miss chime by Raclure](https://freesound.org/people/Raclure/sounds/405548/)
    - Sound effect for buttons to remove all active [TV](https://freesound.org/people/MATRIXXX_/sounds/523553/) channels[, Shutdown.wav by MATRIXXX_](https://freesound.org/people/MATRIXXX_/sounds/523553/)
    - Background sound effect for alert after deleting localStorage [DefectLineTransformer by blaukreuz](https://freesound.org/people/blaukreuz/sounds/440128/)
    - Sound effect for buttons to remove channel [User Interface Clicks and Buttons 1 by original_sound](https://freesound.org/people/original_sound/sounds/493551/)
    - Stale variation[https://alienxproject.github.io/X/](https://alienxproject.github.io/X/)
    - "Variation" [https://navezjt.github.io/JCN-TV/](https://navezjt.github.io/JCN-TV/)
    - Complementary link Suicide Prevention Hotline
    - Flicker effect for background after deleting localStorage [https://codepen.io/frbarbre/pen/BaObOXL](https://codepen.io/frbarbre/pen/BaObOXL)
    - Flicker effect for text after localStorage deletion [https://codepen.io/patrickhlauke/pen/YaoBop](https://codepen.io/patrickhlauke/pen/YaoBop)
    - Dark/light theme, SVG backgrounds themes generated with [https://wickedbackgrounds.com/app](https://wickedbackgrounds.com/app) transformed to css with [https://yoksel.github.io/url-encoder/](https://yoksel.github.io/url-encoder/)
    - Option to change/replace channel from grid
    - Ability to remember channel number selection per row with localStorage
    - Alert if channel search returns no results
    - Option to reorder channel buttons in ascending or descending order
    - Screenshots for PWA, made with Progressier [https://progressier.com](https://progressier.com)
    - isMobile library [https://github.com/kaimallea/isMobile](https://github.com/kaimallea/isMobile)

- Removed
    - Blocked.txt file
    - emergencia.html file
    - Archivo archivo.html file
    - SVG social media logos
    - Example images site v0.07
    - [CHV 2](https://www.chilevision.cl/senal-online)

## [v0.15]

- Changed
    - Link &lt;<https://ssd.eff.org/es/playlist/%C2%BFactivista-o-manifestante>&gt; replaced with &lt;<https://ssd.eff.org/es/module/asistir-una-protesta>&gt; due to 404 error

- Added
    - Icon to external links to better communicate that clicking will leave the site &lt;i class="bi bi-box-arrow-up-right"&gt;&lt;/i&gt;

- Removed
    - Modal Records of protests in Chile
    - Modal Report human rights violations
    - Related links COVID-19 alongside Modal's "pacomap.live" Complementary links
    - Modal GitHub Projects section Complementary Links
    - Sites: Capucha Informativa (does not load) ChileOkulto (content deleted) En Punto (last updated 2021) Megáfono Popular (does not load) Piensa Prensa (site redirects to advertising) Primera Línea Revolucionaria Chile (last updated 2022) Revista ChileLibre (does not load) Verdad Ahora (last updated 2023) Radio 19 de abril Cobertura colectiva (does not load) Radio Manque (does not load) RadioTV-Liberación (does not load)
    - Useful information on fires (channel and modal)
    - Link Variation by u/sebastianrw [https://whywelove.news/love/country/chile/envivo](https://whywelove.news/love/country/chile/envivo)

## [v0.14]

- Changed
    - JavaScript code reduced with ChatGPT-3.5 partner

## [v0.13]

- Changed
    - Link to Pottersys website; [http://pslabs.cl/tele.html](http://pslabs.cl/tele.html) -&gt; [https://www.viendotele.cl/](https://www.viendotele.cl/)
    - Default signals

- Added

## [v0.12]

- Changed
    - Changed Bootstrap Icons version from 1.9.0 to 1.10.4
    - Slight redesign, focus on using external Bootstrap Icons library icons rather than emojis for better compatibility

- Removed
    - SVG icons folder

## [v0.11]

- Changed
    - Semantic changes in naming conventions for functions and channel listing features (basically camelCase)

- Added
    - Channel filter by country flag within modal.

## [v0.10]

- Changed
    - Migrated repository from "tele" to "teles" due to DMCA ([https://github.com/github/dmca/blob/master/2022/06/2022-06-06-corus.md](https://github.com/github/dmca/blob/master/2022/06/2022-06-06-corus.md) thanks GitHub for ignoring my response despite having followed the steps you requested, it was a good and pleasant experience 10/10)

## [v0.09]

- Added
    - Mention of [https://flagpedia.net/](https://flagpedia.net/) in NOTICE.md file
    - Button to switch to full screen
    - Button to remove signal from grid

- Changed
    - Country flags now come dynamically from [https://flagcdn.com](https://flagcdn.com) (Thanks to digging into the projects of @martinsantibanez/tele-react and @AINMcl/MonitorTV)
    - UCI 2 -&gt; Native

- Removed
    - SVG files folder for country flags
    - License "CSS Range Slider – with Fill"

## Fixed

- Code stopped executing correctly when attempting to load channels from localStorage that were no longer in the active list

## [v0.08]

- Added
    - Added pwabuilder and pwa-update licenses to "NOTICE.md"
    - Added github project [https://github.com/marcosins/convencion-chile](https://github.com/marcosins/convencion-chile) to list of complementary links
    - Created "features.md" file
    - Created file "changelog.md"

- Changed
    - Fixed channel button effect after click (":focus" inherited from Bootstrap became part of "pulsate-2" animation)
    - Less distracting channel button animation ("pulsate-3")
    - Replaced "|" in manifesto with "-" for title compatibility with Windows
    - Customizations are now also accessible via the navbar
    - PWA-update alert position moved above floating button, not behind
    - Changed script syntax from snake_case to camelCase
    - Renamed variables to be more descriptive
    - TVN 3 => TVN 2
    - Channel 13 4 => Channel 13 3

- Removed
    - Removed (temporary) message suggesting css not updating

## [v0.07]

- Added
    - Added Workbox library (site now works as PWA) and fixed loading issue present in first launch. #5
    - Added button to clear all active channels

- Changed
    - Legal notice modal now disabled with localStorage, eliminating the need to create a cookie
    - Using localStorage, active channels now persist after reloading the site
    - Changed colors to improve contrast
    - Redesigned customization panel (side panel)
    - Disclaimer rewritten to better adapt in case of forking the repository
    - SVG files extracted from HTML code, now used as images
    - Link mentioning first favicon now refers to original commit
    - Deprecated
    - Bootstrap and videojs libraries removed from project files, reloaded via CDN

- Removed
    - First favicon
    - All.txt file
    - Voting tips html file

## [v0.06]

- Added

- Changed
    - Reduced channels.js code
    - Reduced styles.css code
    - Rewritten channel creation code (increases readability)
    - Rewritten disclaimer to define project scope
    - Renamed scripts.js -> main.js
    - Renamed images folder -&gt; img
    - Channel button design
    - Added link to the repository that inspired the project ([https://github.com/PotterSys/canales-tele](https://github.com/PotterSys/canales-tele)) to the readme file (along with giving it its well-deserved star, my apologies "PotterSys," I didn't realize you had the page in the same repository)
    - Added stackoverflow links that have been used to make the code easier to understand
    - The "&lt; a &gt;" tag defaults to "rel=noopener," so it was removed ([https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noopener](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noopener)).
    - Renamed ChilledCow -> Lofi Girl
    - Renamed Chamber of Deputies YouTube Channel → Chamber of Deputies YT
    - Devised a way to warn about possible CSS loading errors in case the site is updated but the CSS file is not (as happened to me).
    - Channel buttons are now generated with a grid so that they are all the same size
    - Rewrote code for channel buttons

- Removed

## [v0.05]

- Changed
    - Bootstrap V4.6.0 > 5.1.3
    - Created sidebar with site configuration options (I've recently accessed the page from my phone and I think it's better if they are accessible without obstructing the content you're trying to adjust)
    - I converted some scripts to vanilla JS to start phasing out jQuery (there are two left that I didn't know how to translate ¯_(ツ)_/¯).
    - General design changes
    - We have a filter! (gg jQuery)
    - The broadcast on/off button works great now
    - Preview images updated
    - CSS rewritten using nesting and separated (a little better) by sections
    - Deprecated
    - Popper library (built into the Bootstrap library)
    - jQuery library

- Removed
    - Images from previous versions removed

## [v0.04]

- Added
    - Variation by martinsantibanez ([https://github.com/martinsantibanez/tele-react](https://github.com/martinsantibanez/tele-react))

- Changed
    - Changed script syntax for better readability
    - New example images
    - Incorporated versioning "system"
    - Alternative media outlets listed in alphabetical order (to a certain extent)

## [v0.03]

- Added
    - Peru variation added by SanguiNET [https://github.com/SanguiNET/tele](https://github.com/SanguiNET/tele)
    - Spanish language to videojs

- Changed
    - Channel list format change (for my sanity) for easier editing [https://gist.github.com/joyrexus/16041f2426450e73f5df9391f7f7ae5f](https://gist.github.com/joyrexus/16041f2426450e73f5df9391f7f7ae5f)
    - Updated README channel list
    - Updated variation link by AINMcl [https://github.com/AINMcl/MonitorTV](https://github.com/AINMcl/MonitorTV) (changed "monitors" to "MonitorTV")
    - Table of versions created separately from links found unrelated to the project
    - JS channels reduced by a couple of lines
    - Finally took the time to automate the creation of videojs players for m3u8 channels
    - Changed variable syntax (var => let) and renamed some of them as well
    - Reorganized project file structure
    - Separated channels from the rest of the scripts
    - Bootstrap library (CSS only) now inside project files
    - External libraries (main ones, since iframes are not) are now called from within the repository and not externally from other servers
    - Minor change in modal credits
    - Channels have an SVG of their flags according to the country where the transmission originates (not all)
    - Updated href tag (+nofollow noreferrer)
    - Improvement in responsive size with the use of "clamp" (deleting media queries)
    - Search filter fixed. Now allows accents and the letter ñ.
    - Changed "name-bar" position (it bothered me when I wanted to read the news in the smaller bar)
    - Great, great

- Removed
    - Removed Font Awesome for icons, replaced with pure SVG's
