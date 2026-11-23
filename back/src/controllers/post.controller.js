import {
  getPostList,
  getPostDetail,
  writePost,
  editPost,
  removePost,
} from "../services/post.service.js";

// 게시글 목록
export const getPostListController = async (req, res, next) => {
  try {
    const result = await getPostList(req.validatedQuery);

    return res.status(200).json({
      success: true,
      message: "게시글 목록을 조회했습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 상세
export const getPostDetailController = async (req, res, next) => {
  try {
    const post = await getPostDetail(req.params.postId);

    return res.status(200).json({
      success: true,
      message: "게시글을 조회했습니다.",
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 작성
export const createPostController = async (req, res, next) => {
  try {
    const post = await writePost({
      userId: req.user.id,
      title: req.validatedBody.title,
      content: req.validatedBody.content,
    });

    return res.status(201).json({
      success: true,
      message: "게시글이 등록되었습니다.",
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 수정
export const updatePostController = async (req, res, next) => {
  try {
    const post = await editPost({
      postId: req.params.postId,
      userId: req.user.id,
      role: req.user.role,
      title: req.validatedBody.title,
      content: req.validatedBody.content,
    });

    return res.status(200).json({
      success: true,
      message: "게시글이 수정되었습니다.",
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 삭제
export const deletePostController = async (req, res, next) => {
  try {
    const result = await removePost({
      postId: req.params.postId,
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(200).json({
      success: true,
      message: "게시글이 삭제되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
