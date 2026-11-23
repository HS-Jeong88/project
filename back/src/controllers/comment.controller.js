import {
  getComments,
  addComment,
  editComment,
  removeComment,
} from "../services/comment.service.js";

// 댓글 목록
export const getCommentsController = async (req, res, next) => {
  try {
    const result = await getComments({
      postId: req.validatedParams.postId,
      page: req.validatedQuery.page,
      limit: req.validatedQuery.limit,
    });

    return res.status(200).json({
      success: true,
      message: "댓글 목록을 조회했습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 댓글 작성
export const createCommentController = async (req, res, next) => {
  try {
    const comment = await addComment({
      postId: req.validatedParams.postId,
      userId: req.user.id,
      content: req.validatedBody.content,
    });

    return res.status(201).json({
      success: true,
      message: "댓글이 등록되었습니다.",
      data: {
        comment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 댓글 수정
export const updateCommentController = async (req, res, next) => {
  try {
    const comment = await editComment({
      commentId: req.validatedParams.commentId,
      content: req.validatedBody.content,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "댓글이 수정되었습니다.",
      data: {
        comment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 댓글 삭제
export const deleteCommentController = async (req, res, next) => {
  try {
    const result = await removeComment({
      commentId: req.validatedParams.commentId,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "댓글이 삭제되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
