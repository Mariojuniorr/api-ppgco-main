import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ZodValidationPipe, OrderDto, Filters } from 'src/core';

import { Can } from 'src/permissions';
import { StudentService } from './student.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  createStudentSchema,
  updateStudentSchema,
  PaginatedStudentDto,
} from './dto';
import { Student } from './entities';
import { Permissions } from './student.enum';
import { DeleteSuccessResponse, UpdateSuccessResponse } from 'src/core/dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Students')
@Controller('students')
export class StudentController {
  public constructor(private readonly studentService: StudentService) {}

  @Get()
  @Can(Permissions.List)
  @ApiOperation({ summary: 'List all students', description: 'Retrieves a paginated list of students based on search and filters.' })
  @ApiOkResponse({ type: PaginatedStudentDto })
  public findAll(
    @Query('page') page: string,
    @Query('perPage') perPage: string,
    @Query('search') search: string,
    @Query('searchIn') searchIn: string,
    @Query('orderBy') order: OrderDto[],
    @Query('filters') filters: Filters,
  ) {
    return this.studentService.find(
      +page,
      +perPage,
      search,
      searchIn,
      order,
      filters,
    );
  }

  @Get('/count')
  @Can(Permissions.List)
  @ApiOperation({ summary: 'Count students', description: 'Returns the total count of students. Supports grouping.' })
  @ApiOkResponse({ type: Number })
  public count(
    @Query('search') search: string,
    @Query('searchIn') searchIn: string,
    @Query('groupBy') groupBy: string,
    @Query('attributes') attributes: string | string[],
  ) {
    if (!groupBy) {
      return this.studentService.count(search, searchIn, attributes);
    }

    return this.studentService.groupedCount(
      search,
      searchIn,
      groupBy,
      attributes,
    );
  }

  @Get('/count-with-late-milestones-by-course')
  @Can(Permissions.List)
  @ApiOperation({ summary: 'Count students with late milestones per course', description: 'Gets count of students grouped by course that have delayed milestones.' })
  @ApiOkResponse({ type: Number })
  public countWithLateMilestonesByCourse() {
    return this.studentService.countStudentsWithLateMilestonesByCourse();
  }

  @Get('/get-with-late-milestones')
  @ApiOperation({ summary: 'List students with late milestones', description: 'Retrieves all students that are currently delayed with their project milestones.' })
  @ApiOkResponse({ type: Number })
  @Can(Permissions.List)
  public getWithLateMilestones() {
    return this.studentService.getStudentsWithLateMilestones();
  }

  @Get(':id')
  // @Can(Permissions.Read)
  @ApiOperation({ summary: 'Get a single student', description: 'Retrieves a student by ID, including project data.' })
  @ApiOkResponse({ type: Student })
  public findOne(@Param('id') id: string) {
    return this.studentService.findOneFullData(+id);
  }

  @Post()
  @Can(Permissions.Create)
  @ApiOperation({ summary: 'Create a new student', description: 'Registers a new student record in the system.' })
  @ApiCreatedResponse({ type: Student })
  public create(
    @Body(new ZodValidationPipe(createStudentSchema))
    createStudentDto: CreateStudentDto,
  ) {
    return this.studentService.create(createStudentDto);
  }

  @Patch(':id')
  @Can(Permissions.Update)
  @ApiOperation({ summary: 'Update a student', description: 'Partially updates an existing student record.' })
  @ApiOkResponse({ type: UpdateSuccessResponse })
  public async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStudentSchema))
    updateStudentDto: UpdateStudentDto,
  ) {
    const [
      [userAffecteds],
      [studentAffecteds],
      [projectAffecteds],
      [coadvisorsAffecteds],
    ] = await this.studentService.update(+id, updateStudentDto);

    console.log({
      userAffecteds,
      studentAffecteds,
      projectAffecteds,
      coadvisorsAffecteds,
    });

    const affecteds =
      userAffecteds ||
      studentAffecteds ||
      projectAffecteds ||
      coadvisorsAffecteds;

    if (!affecteds) {
      throw new InternalServerErrorException(
        'Student record could not be updated',
      );
    }

    return {
      updateds: +affecteds,
      message: 'Student updated successfully',
    };
  }

  @Delete(':id')
  @Can(Permissions.Delete)
  @ApiOperation({ summary: 'Delete a student', description: 'Removes a student record from the system.' })
  @ApiOkResponse({ type: DeleteSuccessResponse })
  public destroy(@Param('id') id: string) {
    const deleteds = this.studentService.remove(+id);
    return {
      message: 'Student deleted successfully',
      deleteds,
    };
  }
}
