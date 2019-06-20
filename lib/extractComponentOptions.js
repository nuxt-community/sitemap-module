const { readFileSync } = require('fs')

const acorn = require('acorn')
const dynamicImport = require('acorn-dynamic-import')
const inject = require('acorn-dynamic-import/lib/walk')
const walker = inject.default(require('acorn-walk'))
// Must not be an explicit dependency to avoid version mismatch issue.
// See https://github.com/nuxt-community/nuxt-i18n/issues/297
const compiler = require('vue-template-compiler')
// const { COMPONENT_OPTIONS_BLOCK, COMPONENT_OPTIONS_KEY } = require('constants')

function extractComponentOptions (path, blockName, key) {
  let extractedData = key ? '' : {}
  let Component = compiler.parseComponent(readFileSync(path).toString())
  const block =
    Component[blockName] ||
    Component.customBlocks.find(block => block.type === blockName)
  if (!block || block.content.length < 1) {
    return extractedData
  }
  const parsed = acorn.Parser.extend(dynamicImport.default).parse(
    block.content,
    {
      ecmaVersion: 10,
      sourceType: 'module'
    }
  )
  walker.simple(
    parsed,
    {
      Property (node) {
        const data = block.content.substring(node.start, node.end)
        try {
          if (key) {
            if (node.key.name === key) extractedData = eval(`({${data}})`)[key] // eslint-disable-line no-eval
          } else Object.assign(extractedData, eval(`({${data}})`)) // eslint-disable-line no-eval
        } catch (e) {}
      }
    },
    walker.base
  )

  return extractedData
}

module.exports = extractComponentOptions
//   .bind(
//   this,
//   COMPONENT_OPTIONS_BLOCK,
//   COMPONENT_OPTIONS_KEY
// )
