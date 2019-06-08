/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Sample transaction
 * @param {org.studnetwork.AddGradeCard} card
 * @transaction
 */
async function AddGradeCard(card) {
    return getAssetRegistry('org.studnetwork.GradeCard').then(function(result) {
        var factory = getFactory();
        var newAsset = factory.newResource(
            'org.studnetwork',
            'GradeCard',
            card.aGradeCard.gradecardId);
        newAsset.description = card.aGradeCard.description;
        newAsset.hashValue = card.aGradeCard.hashValue;

        return result.add(newAsset);
    });
}