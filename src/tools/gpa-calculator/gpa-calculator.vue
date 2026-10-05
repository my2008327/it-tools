<script setup lang="ts">
import { Plus, Trash } from '@vicons/tabler';
import { useStorage } from '@vueuse/core';

interface Course {
  name: string;
  score: string;
  credits: number | undefined;
}

type ScaleType = '5' | '4';

const scaleType = useStorage<ScaleType>('gpa-calculator:scaleType', '5');

const courses = useStorage<Course[]>('gpa-calculator:courses', [
  { name: '', score: '', credits: undefined },
  { name: '', score: '', credits: undefined },
  { name: '', score: '', credits: undefined },
]);

// 5分制绩点映射（北理莫斯科大学）
// 5 = Excellent, 4 = Good, 3 = Pass, 2 = Fail
function convertToGpa5(score: string): number | null {
  const trimmed = score.trim();
  if (trimmed === '') return null;

  const num = parseFloat(trimmed);
  if (Number.isNaN(num)) return null;

  if (num > 5) return null;
  if (num === 5) return 5;
  if (num === 4) return 4;
  if (num >= 3 && num < 4) return 3;
  if (num >= 0 && num < 3) return 0;
  return null;
}

// 4分制绩点映射（通用）
function convertToGpa4(score: string): number | null {
  const trimmed = score.trim().toUpperCase();
  if (trimmed === '') return null;

  // 字母等级
  const letterMap: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0,
  };
  if (letterMap[trimmed] !== undefined) return letterMap[trimmed];

  // 百分制分数
  const num = parseFloat(trimmed);
  if (Number.isNaN(num)) return null;

  if (num >= 90) return 4.0;
  if (num >= 85) return 3.7;
  if (num >= 82) return 3.3;
  if (num >= 78) return 3.0;
  if (num >= 75) return 2.7;
  if (num >= 72) return 2.3;
  if (num >= 68) return 2.0;
  if (num >= 64) return 1.7;
  if (num >= 60) return 1.3;
  if (num >= 55) return 1.0;
  return 0.0;
}

function convertScore(score: string): number | null {
  return scaleType.value === '5' ? convertToGpa5(score) : convertToGpa4(score);
}

const gpaResult = computed(() => {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const course of courses.value) {
    const gpa = convertScore(course.score);
    const credits = course.credits;
    if (gpa !== null && credits !== undefined && credits > 0) {
      totalPoints += gpa * credits;
      totalCredits += credits;
    }
  }

  if (totalCredits === 0) return null;
  return {
    gpa: Math.round((totalPoints / totalCredits) * 1000) / 1000,
    totalCredits,
    totalPoints: Math.round(totalPoints * 1000) / 1000,
  };
});

function addCourse() {
  courses.value.push({ name: '', score: '', credits: undefined });
}

function removeCourse(index: number) {
  courses.value.splice(index, 1);
}

function resetCourses() {
  courses.value = [
    { name: '', score: '', credits: undefined },
    { name: '', score: '', credits: undefined },
    { name: '', score: '', credits: undefined },
  ];
}

const scaleLabel = computed(() => scaleType.value === '5' ? '5分制（北理莫斯科大学）' : '4分制（通用）');
</script>

<template>
  <div style="flex: 0 0 100%">
    <div style="margin: 0 auto; max-width: 800px">
      <!-- 绩点制度选择 -->
      <c-card mb-4>
        <div mb-3 font-bold text-lg>
          绩点制度
        </div>
        <n-radio-group v-model:value="scaleType" name="scaleType">
          <n-radio-button value="5">
            5分制（北理莫斯科大学）
          </n-radio-button>
          <n-radio-button value="4">
            4分制（通用）
          </n-radio-button>
        </n-radio-group>
        <div mt-2 text-sm op-60>
          {{ scaleType === '5' ? '评分标准：5=优秀, 4=良好, 3=及格, <3=不及格(绩点0)' : '评分标准：A=4.0, B=3.0, C=2.0, D=1.0, F=0；或百分制自动转换' }}
        </div>
      </c-card>

      <!-- 课程列表 -->
      <c-card mb-4>
        <div mb-3 flex items-center justify-between>
          <div font-bold text-lg>
            课程列表
          </div>
          <c-button size="small" @click="addCourse()">
            <n-icon :component="Plus" mr-1 size="16" />
            添加课程
          </c-button>
        </div>

        <div v-for="(course, index) in courses" :key="index" mb-3>
          <div flex gap-2 items-start>
            <div style="min-width: 32px; padding-top: 8px; text-align: center; font-weight: 500; op-60">
              {{ index + 1 }}
            </div>
            <c-input-text
              v-model:value="course.name"
              placeholder="课程名称（选填）"
              style="flex: 2"
            />
            <c-input-text
              v-model:value="course.score"
              :placeholder="scaleType === '5' ? '分数 (0-5)' : '分数或等级'"
              style="flex: 1"
            />
            <n-input-number
              v-model:value="course.credits"
              :min="0"
              :max="20"
              placeholder="学分"
              style="flex: 1"
            />
            <c-button
              variant="text"
              size="small"
              :disabled="courses.length <= 1"
              @click="removeCourse(index)"
            >
              <n-icon :component="Trash" depth="3" size="18" />
            </c-button>
          </div>
        </div>

        <div mt-3 flex justify-center gap-3>
          <c-button size="small" @click="addCourse()">
            <n-icon :component="Plus" mr-1 size="16" />
            添加课程
          </c-button>
          <c-button size="small" @click="resetCourses()">
            重置
          </c-button>
        </div>
      </c-card>

      <!-- 计算结果 -->
      <c-card>
        <div mb-3 font-bold text-lg>
          计算结果
        </div>
        <div v-if="gpaResult" grid grid-cols-3 gap-4>
          <div text-center>
            <div text-sm op-60>
              加权GPA
            </div>
            <div text-3xl font-bold color-primary>
              {{ gpaResult.gpa.toFixed(3) }}
            </div>
            <div text-xs op-40>
              / {{ scaleType === '5' ? '5.000' : '4.000' }}
            </div>
          </div>
          <div text-center>
            <div text-sm op-60>
              总学分
            </div>
            <div text-3xl font-bold>
              {{ gpaResult.totalCredits }}
            </div>
          </div>
          <div text-center>
            <div text-sm op-60>
              加权总分
            </div>
            <div text-3xl font-bold>
              {{ gpaResult.totalPoints }}
            </div>
          </div>
        </div>
        <div v-else text-center py-4 op-40>
          请输入课程的分数和学分以计算GPA
        </div>
      </c-card>
    </div>
  </div>
</template>

<style lang="less" scoped>
</style>
