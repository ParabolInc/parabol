/**
 * Types for the "areas" of the app a user can be in.
 *
 * @flow
 */
import {MEETING, TEAM_DASH, USER_DASH} from 'universal/utils/constants';

export type Area = MEETING | TEAM_DASH | USER_DASH;
