const fs = require('fs');
const handlebars = require('handlebars');

const main = () => {
  const templatePath = process.env.INPUT_TEMPLATE_PATH; // Set in the workflow file
  const outputPath = process.env.INPUT_OUTPUT_PATH; // Set in the workflow file
  const data = JSON.parse(process.env.INPUT_TEMPLATE_DATA); // Set in the workflow file

  const template = fs.readFileSync(templatePath, 'utf8');
  const compiledTemplate = handlebars.compile(template);
  const result = compiledTemplate(data);

  fs.writeFileSync(outputPath, result);
  console.log(`Template rendered to ${outputPath}`);
};

main();
