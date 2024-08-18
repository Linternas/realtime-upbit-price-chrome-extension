/* eslint-disable no-undef */
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered`);

  chrome.action.openPopup();
});
