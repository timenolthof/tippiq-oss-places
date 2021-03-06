
import { AttributeRepository } from '../../../api/modules/attributes';
import { PolicyRepository } from '../../../api/modules/policies/repositories';
import { UserPlaceRoleRepository } from '../../../api/modules/user-place-roles';
import { PlaceRepository } from '../../../api/modules/places';
import { getSignedJwt } from '../../../api/common/test-utils';
import { insertTestData, removeTestData } from '../../../api/common/seed-utils';
import validAttribute from '../../../api/testdata/valid-attribute';

const page = {
  isLoaded: () => protractor.ExpectedConditions.presenceOf(element(by.id('page-edit-policies'))),
  heading: () => element(by.css('h1')),
};

const userId = '00000000-0000-0000-0000-000000000000';
const placeId = '00000001-0001-0000-0000-000000000000';
const tippiqId = '00000001-0001-0000-0000-000000000000';
const serviceProviderId = '00000002-0002-0000-0000-000000000002';

describe('Edit Policies container', () => {
  let authToken;

  beforeAll(() => insertTestData());
  afterAll(() => removeTestData());

  beforeAll(() => PlaceRepository
    .create({ id: placeId }, { method: 'insert' })
    .tap(() => {
      afterAll(() => PlaceRepository.deleteById(placeId));
    })
    .then(() => Promise
      .all([
        AttributeRepository
          .create({
            place_id: placeId,
            type: validAttribute.data.attributeType,
            ...validAttribute,
          }),
        UserPlaceRoleRepository
          .create({ placeId, tippiqId, role: 'test' }),
      ])
    )
  );

  afterAll(() => PolicyRepository.deleteWhere({ user_id: userId }));
  afterAll(() => AttributeRepository.deleteWhere({ place_id: placeId }));
  afterAll(() => UserPlaceRoleRepository.deleteWhere({ place_id: placeId }));
  afterAll(() => PlaceRepository.deleteById(placeId));

  beforeAll(() => getSignedJwt({ sub: userId, placeId }).then((token) => {
    authToken = token;
  }));

  beforeAll(() => {
    browser.get(`/huis/${placeId}/${serviceProviderId}/huisregels/wijzigen?token=${authToken}`);
    browser.wait(page.isLoaded(), 10000);
  });

  it('should show a heading', () => {
    expect(page.heading().isPresent()).toBe(true);
  });
});
