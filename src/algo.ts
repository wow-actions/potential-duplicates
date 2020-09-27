import { Dic } from './dic'

export namespace Algo {
  /**
   * Removes punctuation and common words from a given phrase.
   * Additionally, finds and remplaces predefined synonyms for even faster
   * and more accurate results.
   */
  function prepare(phrase: string) {
    let ret = phrase.toLowerCase()

    for (const punct of Dic.punctuation) {
      ret = ret.replace(new RegExp(`\\${punct}`, 'g'), ' ')
    }

    for (const word in Dic.synonyms) {
      ret = ret.replace(
        new RegExp((Dic.synonyms as any)[word].join('|'), 'gi'),
        word,
      )
    }

    for (const exclude of Dic.excludes) {
      ret = ret.replace(new RegExp(`\\b${exclude}\\s\\b`, 'g'), '')
    }

    return ret
  }

  /**
   * The Damerau–Levenshtein distance between two words is the minimum number
   * of operations (consisting of insertions, deletions or substitutions of a
   * single character, or transposition of two adjacent characters) required
   * to change one word into the other.
   *
   * @see     https://en.wikipedia.org/wiki/Levenshtein_distance
   * @see     https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
   * @see     https://rosettacode.org/wiki/Levenshtein_distance#JavaScript
   */
  function distance(a: string, b: string) {
    const [al, bl] = [a.length, b.length]
    const matrix: number[][] = []

    if (a === b) return 0
    if (!al) return bl
    if (!bl) return al

    for (let i = 0; i <= al; i += 1) {
      matrix[i] = []
      matrix[i][0] = i
    }

    for (let j = 0; j <= bl; j += 1) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= al; i += 1) {
      for (let j = 1; j <= bl; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1

        matrix[i][j] = Math.min(
          matrix[i - 1][j + 0] + 1, // deletion
          matrix[i + 0][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost, // substitution
        )

        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          matrix[i][j] = Math.min(
            matrix[i + 0][j + 0],
            matrix[i - 2][j - 2] + cost, // transposition
          )
        }
      }
    }

    return matrix[al][bl]
  }

  /**
   * Compares two strings and returns how similar they are. The result is a
   * float in interval [0.0; 1.0].
   */
  function similarity(i: string, j: string) {
    const length = Math.max(i.length, j.length)
    return length === 0 ? 1.0 : (length - distance(i, j)) / length
  }

  // How many points remove per missing word (see `compare()`):
  const ERROR_ADJ = 0.15

  /**
   * Compares two phrases and returns how similar they are. The results is a
   * float in interval [0.0; 1.0]. The algorithm works as follows:
   *
   * 1. Preparation:
   *    Common words, punctuation symbols and synonyms are removed. Sentences
   *    are then split into separate words for further analysis. We always
   *    operate on the list which contains less words.
   * 2. Calculations:
   *    For each word in the first phrase, we try to find a analogue in the
   *    second one. This is done using the Damerau–Levenshtein distance
   *    algorithm. Words with the biggest probability of being an analogue are
   *    added to the list.
   * 3. Error adjustment:
   *    We calculate the difference between words amount in each phrase. For
   *    each word, we remove a certain probability from the final score. This
   *    step is necessary in situations where the first sentence contains only
   *    few word and direct analogues in the second one. Without error
   *    adjustment, this would give us a result of 1.0. For example:
   *      A: "Testing module foo"
   *      B: "Testing if there's not memory leak in module bar"
   *
   * @todo    include phrase-length difference in the observational error
   */
  export function compare(phraseA: string, phraseB: string) {
    let wordsA = prepare(phraseA).split(' ')
    let wordsB = prepare(phraseB).split(' ')
    let total = 0

    if (wordsA.length > wordsB.length) {
      ;[wordsA, wordsB] = [wordsB, wordsA]
    }

    for (const wordA of wordsA) {
      const temp = []
      for (const wordB of wordsB) {
        temp.push(similarity(wordA, wordB))
      }

      total += Math.max.apply(null, temp)
    }

    // Direct score:
    total /= wordsA.length
    // Error adjustment:
    total -= (wordsB.length - wordsA.length) * ERROR_ADJ

    return total
  }
}
