import TasteSuggestApi from '../api/tasteSuggest';
import FakeTasteSuggestClient from '@/shared/api/fakeTasteSuggestClient';
import TasteSuggestClient from '@/shared/api/tasteSuggestClient';

const client =
  window.location.hostname != 'localhost'
    ? new FakeTasteSuggestClient()
    : new TasteSuggestClient();

export const tasteSuggestApi = new TasteSuggestApi(client);
