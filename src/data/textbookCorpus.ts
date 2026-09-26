import { SourceItem } from '../types';

export interface CorpusModule {
  id: string;
  topic: string;
  subject: string;
  keywords: string[];
  sources: SourceItem[];
  defaultProblemPrompt: string;
}

export const TEXTBOOK_CORPUS: CorpusModule[] = [
  {
    id: 'kinematics-projectiles',
    topic: 'Kinematics & Projectile Motion',
    subject: 'Physics 1st Paper',
    keywords: ['kinematics', 'projectile', 'velocity', 'acceleration', 'range', 'cliff', 'angle', 'trajectory', 'gravity', 'horizontal', 'vertical', 'height', 'flight', 'motion'],
    defaultProblemPrompt: 'A stone is projected at an angle of 30° with an initial velocity of 40 m/s from a cliff of height 20 m. Calculate the time of flight and horizontal range.',
    sources: [
      {
        id: 'tb-phys1-p169',
        type: 'textbook',
        title: 'Physics 1st Paper · Page 169',
        identifier: 'Page 169',
        sourceName: 'Physics 1st Paper',
        categoryLabel: 'Authoritative Textbook',
        excerpt: 'For two-dimensional projectile motion in a uniform gravitational field $g$ neglecting air resistance:\nHorizontal velocity component: $v_x = u \\cos\\theta = \\text{const}$.\nVertical displacement: $y = u\\sin\\theta \\cdot t - \\frac{1}{2}gt^2$.\nMaximum projectile height: $H = \\frac{u^2 \\sin^2\\theta}{2g}$.\nHorizontal range on level terrain: $R = \\frac{u^2 \\sin(2\\theta)}{g}$.',
        formula: 'y = u\\sin\\theta \\cdot t - \\frac{1}{2}gt^2, \\quad R = \\frac{u^2 \\sin 2\\theta}{g}',
        contextSnippet: 'Chapter 3: Two-Dimensional Dynamics, Section 3.4 (Trajectory & Level Invariance)'
      },
      {
        id: 'sim-q-ex04',
        type: 'similar_question',
        title: 'Kinematics Example 04',
        identifier: 'Example 04',
        sourceName: 'Similar Question Reference',
        categoryLabel: 'Similar Question (Pattern)',
        excerpt: 'A projectile is launched from elevated terrain ($h_0 = 20\\text{ m}$) at velocity $u = 40\\text{ m/s}$ inclined at $\\theta = 30^\\circ$ above horizontal. Determine: (a) Time taken until ground contact, (b) Total horizontal ground distance traversed. (Assume $g = 9.8\\text{ m/s}^2$).',
        contextSnippet: 'Used as an analytical pattern for non-level landing boundary condition calculations.'
      },
      {
        id: 'sol-ex04',
        type: 'worked_solution',
        title: 'Kinematics Example 04 Solution',
        identifier: 'Example 04',
        sourceName: 'Worked Solution Reference',
        categoryLabel: 'Worked Solution (Method)',
        excerpt: '1. Resolve velocity components:\n   $u_x = 40\\cos 30^\\circ = 40 \\times \\frac{\\sqrt{3}}{2} \\approx 34.64\\text{ m/s}$\n   $u_y = 40\\sin 30^\\circ = 40 \\times 0.5 = 20.0\\text{ m/s}$\n2. Quadratic root for vertical landing at $y = -20\\text{ m}$:\n   $-20 = 20t - 4.9t^2 \\implies 4.9t^2 - 20t - 20 = 0$\n   $t = \\frac{20 + \\sqrt{400 - 4(4.9)(-20)}}{9.8} = \\frac{20 + 28.14}{9.8} \\approx 4.91\\text{ s}$\n3. Horizontal displacement:\n   $x = u_x \\cdot t = 34.64 \\times 4.91 = 170.1\\text{ m}$.',
        contextSnippet: 'Full algorithmic derivation showing coordinate frame origin assignment at launch cliff edge.'
      },
      {
        id: 'exp-ortho-proj',
        type: 'explanation',
        title: 'Orthogonal Motion Independence',
        identifier: 'Section 3.4 Principle',
        sourceName: 'Pedagogical Theoretical Notes',
        categoryLabel: 'Explanation & Principle',
        excerpt: 'Galileo\'s postulate establishes that horizontal velocity remains strictly invariant under constant gravity because gravitational force exerts zero orthogonal projection along the x-axis. Thus, time-of-flight is dictated purely by 1D vertical boundary kinematics.',
        contextSnippet: 'Fundamental principle explaining vector decoupling in Newtonian gravity fields.'
      }
    ]
  },
  {
    id: 'thermo-carnot',
    topic: 'Thermodynamics & Heat Engines',
    subject: 'Physics 2nd Paper',
    keywords: ['thermodynamics', 'carnot', 'entropy', 'heat', 'engine', 'efficiency', 'isothermal', 'adiabatic', 'temperature', 'kelvin', 'reservoir', 'cycle', 'work'],
    defaultProblemPrompt: 'A Carnot engine operates between heat reservoirs at 500 K and 300 K. It absorbs 1200 J of heat per cycle. Calculate its efficiency and work done per cycle.',
    sources: [
      {
        id: 'tb-phys2-p88',
        type: 'textbook',
        title: 'Physics 2nd Paper · Page 88',
        identifier: 'Page 88',
        sourceName: 'Physics 2nd Paper',
        categoryLabel: 'Authoritative Textbook',
        excerpt: 'The Carnot cycle comprises four reversible stages: two isothermal and two adiabatic expansions/compressions.\nTheoretical efficiency of any reversible engine operating between temperatures $T_H$ and $T_C$:\n$\\eta = 1 - \\frac{T_C}{T_H} = \\frac{W}{Q_H}$.\nBy the Second Law, no engine operating between two given heat reservoirs can be more efficient than a Carnot engine.',
        formula: '\\eta = 1 - \\frac{T_C}{T_H} = \\frac{W_{net}}{Q_H}',
        contextSnippet: 'Chapter 1: Heat & Thermodynamics, Section 1.6 (Reversible Cycles & Thermal Efficiency)'
      },
      {
        id: 'sim-q-thermo-ex02',
        type: 'similar_question',
        title: 'Thermodynamics Example 02',
        identifier: 'Example 02',
        sourceName: 'Similar Question Reference',
        categoryLabel: 'Similar Question (Pattern)',
        excerpt: 'A heat engine working on the Carnot cycle absorbs $1200\\text{ J}$ of heat from a source at $500\\text{ K}$ and rejects heat to a sink at $300\\text{ K}$. Find: (a) The thermal efficiency, (b) Work produced per cycle, (c) Heat rejected to sink.',
        contextSnippet: 'Used as an analytical template for reversible two-temperature reservoir thermal balances.'
      },
      {
        id: 'sol-thermo-ex02',
        type: 'worked_solution',
        title: 'Thermodynamics Example 02 Solution',
        identifier: 'Example 02',
        sourceName: 'Worked Solution Reference',
        categoryLabel: 'Worked Solution (Method)',
        excerpt: '1. Theoretical efficiency:\n   $\\eta = 1 - \\frac{T_C}{T_H} = 1 - \\frac{300}{500} = 1 - 0.60 = 0.40\\text{ (or } 40\\%\\text{)}\n2. Work performed per cycle:\n   $W = \\eta \\cdot Q_H = 0.40 \\times 1200\\text{ J} = 480\\text{ J}$\n3. Heat rejected to the cold sink:\n   $Q_C = Q_H - W = 1200 - 480 = 720\\text{ J}$.',
        contextSnippet: 'Methodology demonstrating energy conservation ($Q_H = W + Q_C$) combined with Carnot relation.'
      },
      {
        id: 'exp-carnot-limit',
        type: 'explanation',
        title: 'Second Law Limit & Entropy Invariance',
        identifier: 'Section 1.6 Principle',
        sourceName: 'Pedagogical Theoretical Notes',
        categoryLabel: 'Explanation & Principle',
        excerpt: 'For a fully reversible cycle, the net entropy change of the universe over one period is $\\Delta S = \\oint \\frac{dQ}{T} = 0$. Because entropy cannot decrease, no real thermodynamic engine with irreversible friction or non-quasi-static expansions can surpass $\\eta_{\\text{Carnot}}$.',
        contextSnippet: 'Theoretical foundation linking Carnot efficiency to Clausius statement and entropy balance.'
      }
    ]
  },
  {
    id: 'induction-faraday',
    topic: 'Electromagnetic Induction & Faraday\'s Law',
    subject: 'Physics 2nd Paper',
    keywords: ['induction', 'faraday', 'lenz', 'magnetic', 'flux', 'emf', 'solenoid', 'coil', 'current', 'voltage', 'tesla', 'weber'],
    defaultProblemPrompt: 'A circular coil of 50 turns with radius 0.1 m lies in a perpendicular magnetic field increasing at 0.5 T/s. Calculate the induced electromotive force.',
    sources: [
      {
        id: 'tb-phys2-p302',
        type: 'textbook',
        title: 'Physics 2nd Paper · Page 302',
        identifier: 'Page 302',
        sourceName: 'Physics 2nd Paper',
        categoryLabel: 'Authoritative Textbook',
        excerpt: 'Faraday\'s Law of Induction states that whenever magnetic flux $\\Phi_B$ threading an electrical loop changes over time, an electromotive force (EMF) is induced:\n$\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$, where $\\Phi_B = \\int \\vec{B} \\cdot d\\vec{A} = BA \\cos\\theta$.\nThe negative sign (Lenz\'s Law) indicates that the induced current establishes a magnetic field opposing the change in original flux.',
        formula: '\\mathcal{E} = -N \\frac{d\\Phi_B}{dt} = -NA \\frac{dB}{dt}',
        contextSnippet: 'Chapter 5: Electromagnetic Induction, Section 5.2 (Flux Derivation & Coil Geometry)'
      },
      {
        id: 'sim-q-ind-ex07',
        type: 'similar_question',
        title: 'Induction Example 07',
        identifier: 'Example 07',
        sourceName: 'Similar Question Reference',
        categoryLabel: 'Similar Question (Pattern)',
        excerpt: 'A 50-turn flat circular loop of wire with radius $r = 10\\text{ cm}$ is oriented normal to a uniform magnetic field. If $B$ increases uniformly from $0.2\\text{ T}$ to $1.2\\text{ T}$ in $2.0\\text{ s}$, calculate the magnitude of the induced EMF in the coil.',
        contextSnippet: 'Example showcasing constant rate of flux change in fixed geometric loop area.'
      },
      {
        id: 'sol-ind-ex07',
        type: 'worked_solution',
        title: 'Induction Example 07 Solution',
        identifier: 'Example 07',
        sourceName: 'Worked Solution Reference',
        categoryLabel: 'Worked Solution (Method)',
        excerpt: '1. Area of circular loop: $A = \\pi r^2 = \\pi (0.10)^2 = 0.01\\pi \\approx 0.0314\\text{ m}^2$.\n2. Rate of magnetic field variation: $\\frac{\\Delta B}{\\Delta t} = \\frac{1.2 - 0.2}{2.0} = 0.50\\text{ T/s}$.\n3. Magnitude of induced EMF:\n   $|\\mathcal{E}| = N A \\left|\\frac{dB}{dt}\\right| = 50 \\times (0.01\\pi) \\times 0.50 = 0.25\\pi \\approx 0.785\\text{ V}$.',
        contextSnippet: 'Step-by-step evaluation of Faraday-Neumann formula for planar multi-turn coils.'
      },
      {
        id: 'exp-lenz-energy',
        type: 'explanation',
        title: 'Lenz Opposition as Energy Conservation',
        identifier: 'Section 5.3 Principle',
        sourceName: 'Pedagogical Theoretical Notes',
        categoryLabel: 'Explanation & Principle',
        excerpt: 'If the induced EMF acted in the same direction as the flux change rather than opposing it, the induced current would reinforce the magnetic field, generating more flux and infinite current without external work, which would violate the First Law of Thermodynamics.',
        contextSnippet: 'Conceptual explanation establishing Lenz\'s law as a direct consequence of energy conservation.'
      }
    ]
  },
  {
    id: 'linear-algebra-eigen',
    topic: 'Eigenvalues & Characteristic Equations',
    subject: 'Linear Algebra',
    keywords: ['eigenvalue', 'eigenvector', 'matrix', 'determinant', 'characteristic', 'polynomial', 'linear', 'diagonal', 'trace'],
    defaultProblemPrompt: 'Find the eigenvalues and corresponding eigenvectors of the matrix A = [[4, 2], [1, 3]].',
    sources: [
      {
        id: 'tb-math-p142',
        type: 'textbook',
        title: 'Linear Algebra · Page 142',
        identifier: 'Page 142',
        sourceName: 'Advanced Linear Algebra',
        categoryLabel: 'Authoritative Textbook',
        excerpt: 'For a square linear operator $A \\in \\mathbb{R}^{n \\times n}$, a scalar $\\lambda$ is an eigenvalue if there exists a non-zero vector $v \\neq 0$ satisfying $Av = \\lambda v$, or equivalently $(A - \\lambda I)v = 0$.\nA non-trivial null space exists if and only if the characteristic determinant vanishes: $\\det(A - \\lambda I) = 0$.\nThe roots of this characteristic equation are the eigenvalues.',
        formula: '\\det(A - \\lambda I) = 0',
        contextSnippet: 'Chapter 5: Spectral Theory, Section 5.1 (Characteristic Polynomials & Invariance)'
      },
      {
        id: 'sim-q-la-ex03',
        type: 'similar_question',
        title: 'Linear Algebra Example 03',
        identifier: 'Example 03',
        sourceName: 'Similar Question Reference',
        categoryLabel: 'Similar Question (Pattern)',
        excerpt: 'Compute the eigenvalues and their corresponding unit eigenvectors for the $2 \\times 2$ transformation matrix $A = \\begin{pmatrix} 4 & 2 \\\\ 1 & 3 \\end{pmatrix}$. Verify that $\\text{Tr}(A) = \\lambda_1 + \\lambda_2$ and $\\det(A) = \\lambda_1 \\lambda_2$.',
        contextSnippet: 'Canonical 2x2 asymmetric matrix spectral decomposition template.'
      },
      {
        id: 'sol-la-ex03',
        type: 'worked_solution',
        title: 'Linear Algebra Example 03 Solution',
        identifier: 'Example 03',
        sourceName: 'Worked Solution Reference',
        categoryLabel: 'Worked Solution (Method)',
        excerpt: '1. Characteristic equation: $\\det(A - \\lambda I) = (4 - \\lambda)(3 - \\lambda) - (2)(1) = 0$.\n   $\\lambda^2 - 7\\lambda + 12 - 2 = 0 \\implies \\lambda^2 - 7\\lambda + 10 = 0$.\n   $(\\lambda - 5)(\\lambda - 2) = 0 \\implies \\lambda_1 = 5, \\; \\lambda_2 = 2$.\n2. For $\\lambda_1 = 5$:\n   $(4-5)x + 2y = 0 \\implies -x + 2y = 0 \\implies v_1 = \\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$.\n3. For $\\lambda_2 = 2$:\n   $(4-2)x + 2y = 0 \\implies 2x + 2y = 0 \\implies v_2 = \\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$.',
        contextSnippet: 'Direct algebraic factorization and kernel resolution for distinct real eigenvalues.'
      },
      {
        id: 'exp-invariant-spaces',
        type: 'explanation',
        title: 'Invariant 1D Geometric Directions',
        identifier: 'Section 5.1 Principle',
        sourceName: 'Pedagogical Theoretical Notes',
        categoryLabel: 'Explanation & Principle',
        excerpt: 'An eigenvector represents a spatial direction along which the linear transformation acts merely as a scalar scaling factor without rotating or shear-distorting the vector axis. The matrix is diagonalizable because the geometric multiplicity equals algebraic multiplicity.',
        contextSnippet: 'Geometric interpretation of eigenvalue transformations in Cartesian vector spaces.'
      }
    ]
  },
  {
    id: 'chem-equilibrium',
    topic: 'Chemical Equilibrium & Le Chatelier',
    subject: 'Chemistry 1st Paper',
    keywords: ['equilibrium', 'chatelier', 'reaction', 'haber', 'ammonia', 'pressure', 'concentration', 'endothermic', 'exothermic', 'kp', 'kc', 'partial'],
    defaultProblemPrompt: 'Consider the Haber synthesis: N2(g) + 3H2(g) <=> 2NH3(g) with ΔH = -92.4 kJ/mol. Explain the effect of increasing pressure and temperature on the equilibrium yield.',
    sources: [
      {
        id: 'tb-chem1-p230',
        type: 'textbook',
        title: 'Chemistry 1st Paper · Page 230',
        identifier: 'Page 230',
        sourceName: 'Chemistry 1st Paper',
        categoryLabel: 'Authoritative Textbook',
        excerpt: 'Le Chatelier\'s Principle dictates: If a system at chemical equilibrium is subjected to a disturbance in concentration, pressure, or temperature, the position of equilibrium will shift in a direction that tends to counteract the applied perturbation.\nFor gases: An increase in total system pressure shifts equilibrium toward the side with fewer moles of gas ($\\Delta n_g < 0$).\nFor exothermic reactions ($\\Delta H < 0$): An increase in temperature shifts equilibrium toward reactants.',
        formula: 'K_p = K_c(RT)^{\\Delta n_g}, \\quad \\ln\\left(\\frac{K_2}{K_1}\\right) = -\\frac{\\Delta H^\\circ}{R}\\left(\\frac{1}{T_2} - \\frac{1}{T_1}\\right)',
        contextSnippet: 'Chapter 4: Chemical Dynamics, Section 4.5 (Perturbation of Homogeneous Gas Equilibria)'
      },
      {
        id: 'sim-q-chem-ex05',
        type: 'similar_question',
        title: 'Equilibrium Example 05',
        identifier: 'Example 05',
        sourceName: 'Similar Question Reference',
        categoryLabel: 'Similar Question (Pattern)',
        excerpt: 'In the exothermic synthesis of ammonia $N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g)$ with $\\Delta H^\\circ = -92.4\\text{ kJ/mol}$, analyze how equilibrium yield is modified by: (1) Doubling container pressure at constant $T$, (2) Heating the reactor from $400^\\circ\\text{C}$ to $600^\\circ\\text{C}$.',
        contextSnippet: 'Standard qualitative and quantitative equilibrium shift analysis model.'
      },
      {
        id: 'sol-chem-ex05',
        type: 'worked_solution',
        title: 'Equilibrium Example 05 Solution',
        identifier: 'Example 05',
        sourceName: 'Worked Solution Reference',
        categoryLabel: 'Worked Solution (Method)',
        excerpt: '1. Pressure analysis: Gas moles on reactant side $= 1 + 3 = 4\\text{ mol}$; on product side $= 2\\text{ mol}$. Hence $\\Delta n_g = 2 - 4 = -2$. Increasing pressure favors the volume-minimizing side; the equilibrium shifts right, boosting $NH_3$ equilibrium fraction.\n2. Temperature analysis: Since the forward reaction is exothermic, heat is effectively a product. Adding heat shifts the system toward reactants (left); hence $K_p$ decreases and equilibrium yield of $NH_3$ drops.',
        contextSnippet: 'Systematic application of Van \'t Hoff equation and stoichiometric mole counting.'
      },
      {
        id: 'exp-reaction-quotient',
        type: 'explanation',
        title: 'Quotient Perturbation Driving Force',
        identifier: 'Section 4.5 Principle',
        sourceName: 'Pedagogical Theoretical Notes',
        categoryLabel: 'Explanation & Principle',
        excerpt: 'Thermodynamically, changing pressure alters the reaction quotient $Q_p = \\frac{P_{NH_3}^2}{P_{N_2} P_{H_2}^3} \\propto \\frac{1}{P^2}$. Increasing pressure lowers $Q_p$ relative to constant $K_p$, forcing $Q_p < K_p$, which thermodynamically mandates net forward conversion until $Q_p = K_p$ is restored.',
        contextSnippet: 'Fundamental thermodynamic justification based on chemical potential and reaction quotients.'
      }
    ]
  }
];

export function retrieveCurriculumSources(userQuery: string): SourceItem[] {
  const normalized = userQuery.toLowerCase();
  
  // Score each module
  let bestMatch: CorpusModule = TEXTBOOK_CORPUS[0];
  let maxScore = -1;

  for (const module of TEXTBOOK_CORPUS) {
    let score = 0;
    for (const kw of module.keywords) {
      if (normalized.includes(kw)) {
        score += 2;
      }
    }
    if (normalized.includes(module.subject.toLowerCase())) {
      score += 3;
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = module;
    }
  }

  // Return the best match's sources
  return bestMatch.sources;
}
