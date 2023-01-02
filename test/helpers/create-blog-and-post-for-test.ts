import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { BlogViewModel } from "../../src/modules/blogs/infrastructure/query-repository/blog-View-Model";
import { PostViewModel } from "../../src/modules/posts/infrastructure/query-repositories/post-View-Model";

export const createBlogsAndPostForTest = async (count: number, accessToken: string, app: INestApplication) => {
  const result: { blog: BlogViewModel, post: PostViewModel }[] = [];
  for (let i = 0; i < count; i++) {
    const responseBlog = await request(app.getHttpServer())
      .post(`/blogger/blogs/`)
      .auth(accessToken, { type: "bearer" })
      .send({
        name: `Mongoose${i}${i}`,
        description: `A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae`,
        websiteUrl: `https://www.mongoose${i}${i}.com`
      })
      .expect(201);
    const responsePost = await request(app.getHttpServer())
      .post(`/blogger/blogs/${responseBlog.body.id}/posts`)
      .auth(accessToken, { type: "bearer" })
      .send({
        title: "string title",
        shortDescription: "string shortDescription",
        content: "string content"
      })
      .expect(201);
    result.push({ blog: responseBlog.body, post: responsePost.body });
  }
  return result;
};
