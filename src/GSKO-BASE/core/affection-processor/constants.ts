import { CHARACTER_FIELDS } from '../../schema/character';

export const PATH_RE = new RegExp(`^chars\.[^.]+\.${CHARACTER_FIELDS.affection}$`);
