export namespace Dic {
  export const excludes = [
    'the',
    'and',
    'a',
    'an',
    'as',
    'at',
    'are',
    'by',
    'when',
    'well',
    'is',
    'it',
    'in',
    'to',
    'till',
    'until',
    'or',
    'on',
    'into',
    'outo',
  ]

  export const punctuation = ['! ', ', ', ' - ', ' – ', '... ', '.. ', '. ']

  export const synonyms = {
    app: ['aplication', 'application', 'client'],
    cli: ['console', 'terminal', 'shell', 'command line interface'],
    null: ['blank', 'empty', 'unfilled', 'nil'],
    module: ['starter', 'package'],
  }
}
