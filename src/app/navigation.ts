export const SCREENS = [
  'landing',
  'home',
  'draw',
  'task',
  'done',
  'notdone',
  'return',
  'vazio',
  'weekend',
  'novasemana',
  'ach',
  'add',
  'edit',
  'pending',
  'settings',
  'cafe',
] as const;

export type Screen = (typeof SCREENS)[number];

export type NavState = {
  screen: Screen;
};

export type NavAction = { type: 'go'; screen: Screen };

export const initialNav: NavState = { screen: 'landing' };

export function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'go':
      if (state.screen === action.screen) return state;
      return { screen: action.screen };
  }
}
