import assert from "assert";

import type { StableMatcher, StableMatcherWithTrace } from "../include/stableMatching.js";

//from homework spec
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

function fisherYates(arr: number[]): number[] {
  if (arr.length < 2) {
    return arr;
  }

  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateInput(n: number): number[][] {
  const inputArray: number[][] = [];

  if (n < 1) {
    return inputArray;
  }

  for (let i = 0; i < n; i++) {
    let row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(j);
    }

    row = fisherYates(row);
    inputArray.push(row);
  }

  return inputArray;
}

const NUM_TESTS = 20; // Change this to some reasonably large value
const N = 6; // Change this to some reasonable size

/**
 * Tests whether or not the supplied function is a solution to the stable matching problem.
 * @param makeStableMatching A possible solution to the stable matching problem
 * @throws An `AssertionError` if `makeStableMatching` in not a solution to the stable matching problem
 */
export function stableMatchingOracle(makeStableMatching: StableMatcher): void {
  for (let i = 0; i < NUM_TESTS; ++i) {
    const companies = generateInput(N);
    const candidates = generateInput(N);
    const hires = makeStableMatching(companies, candidates);

    //right num of hires
    assert(companies.length === hires.length, "Hires length is correct.");

    //check dupes
    const candidatesInHires = hires.map(hire => hire.candidate);
    const uniqueCandidates = new Set(candidatesInHires);
    assert(candidatesInHires.length === uniqueCandidates.size, "No duplicates in hires.");

    const companyToCandidate = []; //candidate id matched with company
    const candidateToCompany = []; //company id matched with candidate

    for (let j = 0; j < N; j++) {
      companyToCandidate.push(-1);
      candidateToCompany.push(-1);
    }

    //check stability
    for (let j = 0; j < hires.length; j++) {
      const companyID = hires[j].company;
      const candidateID = hires[j].candidate;

      assert(companyID >= 0 && companyID < N, "Company ID out of range");
      assert(candidateID >= 0 && candidateID < N, "Candidate ID out of range");

      assert(companyToCandidate[companyID] === -1, "Company already matched.");
      assert(candidateToCompany[candidateID] === -1, "Candidate already matched.");

      companyToCandidate[companyID] = candidateID;
      candidateToCompany[candidateID] = companyID;
    }

    //check for instability
    for (let company = 0; company < N; company++) {
      const currentCandidate = companyToCandidate[company];

      for (let canditate = 0; canditate < N; canditate++) {
        if (canditate === currentCandidate) {
          continue;
        }

        const currentCompany = candidateToCompany[canditate];

        if (
          companies[company].indexOf(canditate) < companies[company].indexOf(currentCandidate) &&
          candidates[canditate].indexOf(company) < candidates[canditate].indexOf(currentCompany)
        ) {
          assert(false, "AssertionError");
        }
      }
    }

    // TODO: More assertions go here.
  }
}

// Part B

/**
 * Tests whether or not the supplied function follows the supplied algorithm.
 * @param makeStableMatchingTrace A possible solution to the stable matching problem and its possible steps
 * @throws An `AssertionError` if `makeStableMatchingTrace` does not follow the specified algorithm, or its steps (trace)
 * do not match with the result (out).
 */
export function stableMatchingRunOracle(makeStableMatchingTrace: StableMatcherWithTrace): void {
  for (let i = 0; i < NUM_TESTS; ++i) {
    const companies = generateInput(N);
    const candidates = generateInput(N);
    const { trace, out } = makeStableMatchingTrace(companies, candidates);

    // Track current matches
    const companyMatches = new Array(N).fill(-1); // -1 means unmatched
    const candidateMatches = new Array(N).fill(-1);

    // Track proposals that have been made
    const companyProposals = [];
    const candidateProposals = [];
    for (let i = 0; i < N; i++) {
      companyProposals.push(new Array(N).fill(false)); // false means no proposal
      candidateProposals.push(new Array(N).fill(false));
    }

    // process each step in the trace
    for (let step = 0; step < trace.length; step++) {
      const offer = trace[step];
      const { from, to, fromCo } = offer;

      // Check that the proposer and proposed IDs are valid
      assert(from >= 0 && from < N, `Invalid proposer ID`);
      assert(to >= 0 && to < N, `Invalid proposed ID`);

      // proposer should not be matched
      if (fromCo) {
        assert(companyMatches[from] === -1, `Matched company made proposal`);
      } else {
        assert(candidateMatches[from] === -1, `Matched candidate made proposal`);
      }

      // proposer should not propose to same person twice
      if (fromCo) {
        assert(!companyProposals[from][to], `Company already proposed to this candidate`);
        companyProposals[from][to] = true;
      } else {
        assert(!candidateProposals[from][to], `Candidate already proposed to this company`);
        candidateProposals[from][to] = true;
      }

      // proposer should propose to highest remaining preference
      if (fromCo) {
        const proposerPreference = companies[from];
        for (let j = 0; j < N; j++) {
          // If there's a candidate j that company from prefers more than candidate to
          // and hasn't proposed to yet, that's an error
          if (proposerPreference.indexOf(j) < proposerPreference.indexOf(to) && !companyProposals[from][j]) {
            assert(false, `Company didn't propose to highest remaining preference`);
          }
        }
      } else {
        const proposerPreference = candidates[from];
        for (let j = 0; j < N; j++) {
          // If there's a company j that candidate from prefers more than company to
          // and hasn't proposed to yet, that's an error
          if (proposerPreference.indexOf(j) < proposerPreference.indexOf(to) && !candidateProposals[from][j]) {
            assert(false, `Candidate didn't propose to highest remaining preference`);
          }
        }
      }

      if (fromCo) {
        // Company proposed to candidate
        if (candidateMatches[to] === -1) {
          // Unmatched candidate should accept
          companyMatches[from] = to;
          candidateMatches[to] = from;
        } else {
          // Check if candidate prefers this new company over current match
          const currentCompany = candidateMatches[to] as number;
          const candidatePreference = candidates[to];
          if (candidatePreference.indexOf(from) < candidatePreference.indexOf(currentCompany)) {
            // Better offer, accept
            companyMatches[currentCompany] = -1; // Previous company is now unmatched
            companyMatches[from] = to;
            candidateMatches[to] = from;
          } else {
            // not a better offer, reject
          }
        }
      } else {
        // Candidate proposed to company
        if (companyMatches[to] === -1) {
          // Unmatched company should accept
          candidateMatches[from] = to;
          companyMatches[to] = from;
        } else {
          // Check if company prefers this new candidate over current match
          const currentCandidate = companyMatches[to] as number;
          const companyPreference = companies[to];
          if (companyPreference.indexOf(from) < companyPreference.indexOf(currentCandidate)) {
            // Better offer, accept
            candidateMatches[currentCandidate] = -1; // Previous candidate is now unmatched
            candidateMatches[from] = to;
            companyMatches[to] = from;
          } else {
            // not a better offer, reject
          }
        }
      }
    }

    // Basic properties to check

    const matchedCompanies = [];
    for (let i = 0; i < N; i++) {
      if (companyMatches[i] !== -1) {
        matchedCompanies.push(i);
      }
    }

    assert(out.length === matchedCompanies.length, `Output length doesn't match number of matched pairs`);

    for (let i = 0; i < out.length; i++) {
      const hire = out[i];
      const company = hire.company;
      const candidate = hire.candidate;

      assert(candidateMatches[candidate] === company, `Candidate matching state inconsistent with output`);
      assert(companyMatches[company] === candidate, `Output doesn't match final state from trace`);
    }
  }
}
