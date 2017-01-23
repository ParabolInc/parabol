// // import React, {Component, PropTypes} from 'react';
// // import {reduxForm, Field} from 'redux-form';
// // import {cashay} from 'cashay';
// // import makeUpdatedUserSchema from 'universal/validation/makeUpdatedUserSchema';
// // import shouldValidate from 'universal/validation/shouldValidate';
// // import sendAssetToS3 from 'universal/utils/sendAssetToS3';
// // import FileInput from 'universal/components/FileInput/FileInput';
// //
// // const validate = (values) => {
// //   const schema = makeUpdatedUserSchema();
// //   return schema(values).errors;
// // };
// //
// // const uploadPicture = async(pictureFile) => {
// //   const {data, error} = cashay.mutate('createUserPicturePutUrl', {
// //     variables: {
// //       contentType: pictureFile.type,
// //       contentLength: pictureFile.size,
// //     }
// //   });
// //   if (error) {
// //     throw new Error(error._error); // eslint-disable-line no-underscore-dangle
// //   }
// //   const {createUserPicturePutUrl: putUrl} = data;
//   {/*return sendAssetToS3(pictureFile, putUrl)*/}
// {/*};*/}
//
// {/*const UserAvatar = (props) => {*/}
//   {/*const {handleSubmit, picture} = props;*/}
//   {/*const updateProfile = (pictureUrl) => {*/}
//     {/*const {userId} = this.props;*/}
//     {/*const options = {*/}
//       {/*variables: {*/}
//         {/*updatedUser: {*/}
//           {/*id: userId,*/}
//           {/*picture: pictureUrl*/}
//         {/*}*/}
//       {/*}*/}
//     {/*};*/}
//     {/*return cashay.mutate('updateUserProfile', options);*/}
//   {/*};*/}
//
//   {/*const onSubmit = async(submissionData) => {*/}
//     {/*const {pictureFile} = submissionData;*/}
//     {/*if (pictureFile && pictureFile.name) {*/}
//       {/*// upload new picture to CDN, then update the user profile:*/}
//       {/*const pictureUrl = await uploadPicture(pictureFile);*/}
//       {/*try {*/}
//         {/*await updateProfile(pictureUrl);*/}
//       {/*} catch (e) {*/}
//         {/*// eslint-disable-line no-undef*/}
//         {/*Raven.captureException(e)*/}
//       {/*}*/}
//     {/*}*/}
//     {/*// no work to do*/}
//     {/*return undefined;*/}
//   {/*};*/}
//
//   {/*return (*/}
//
//     {/*<form onSubmit={handleSubmit(onSubmit)}>*/}
//       {/*<Field*/}
//         {/*accept="image/*"*/}
//         // {/*component={FileInput}*/}
//         {/*name="pictureFile"*/}
//         {/*previousValue={picture}*/}
//         {/*type="file"*/}
//       {/*/>*/}
//     {/*</form>*/}
//   {/*);*/}
// {/*}*/}
//
// {/*export default reduxForm({form: 'userAvatar', shouldValidate, validate})(*/}
//   {/*UserAvatar*/}
// {/*)*/}
