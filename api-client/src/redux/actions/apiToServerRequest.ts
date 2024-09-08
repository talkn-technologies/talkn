import Sequence from '@common/Sequence';
import { ReduxState } from '@api-client/redux/store';
const actions: { [key: string]: (reduxState: ReduxState, requestState: any, actionState: any) => any } = {};
export default actions;
